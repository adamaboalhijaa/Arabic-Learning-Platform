import { MathText } from "./MathText";
import { LessonPractice } from './components/LessonPractice';
import { StudyApp } from "./study/StudyApp";
import { clearLocalStudent, readLocalStudent, saveLocalStudent, type LocalStudent } from './lib/local-session';
import { installLocalBackend } from './lib/local-backend';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp } from '@clerk/react';
import { CLERK_ENABLED, ClerkBridge, useAuth, useClerk } from './lib/auth-bridge';
import { shadcn } from '@clerk/themes';
import { arSA } from '@clerk/localizations';
import { Route, Switch, Link, Redirect, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import { CurriculumAdmin } from './admin/CurriculumAdmin';
import {
  Activity, ArrowLeft, ArrowRight, Award, BookOpen, BookOpenCheck, Check, ChevronLeft,
  CircleHelp, ClipboardList, Clock3, Crown, GraduationCap, House, LogOut,
  Pencil, Plus, RefreshCw, ShieldAlert, Trash2, Trophy, UsersRound, X, Zap
} from 'lucide-react';
import {
  useHealthCheck, getHealthCheckQueryKey, useListGrades, getListGradesQueryKey,
  useListGradeSubjects, getListGradeSubjectsQueryKey, useListSubjectUnits,
  getListSubjectUnitsQueryKey, useListUnitLessons, getListUnitLessonsQueryKey,
  useGetLesson, getGetLessonQueryKey, useGetLessonQuiz, getGetLessonQuizQueryKey,
  useSubmitQuizAttempt, useGetMyProfile, getGetMyProfileQueryKey, useUpdateMyProfile,
  useGetMyDashboard, getGetMyDashboardQueryKey, useGetMyProgress, getGetMyProgressQueryKey,
  useGetLeaderboard, getGetLeaderboardQueryKey, useGetAdminOverview, getGetAdminOverviewQueryKey,
  useListAdminGrades, getListAdminGradesQueryKey, useCreateGrade, useUpdateGrade,
  useDeleteGrade, useListAdminSubjects, getListAdminSubjectsQueryKey, useCreateSubject,
  useUpdateSubject, useDeleteSubject, useListAdminUnits, getListAdminUnitsQueryKey,
  useCreateUnit, useUpdateUnit, useDeleteUnit, useListAdminLessons,
  getListAdminLessonsQueryKey, useCreateLesson, useUpdateLesson, useDeleteLesson,
  useListAdminQuestions, getListAdminQuestionsQueryKey, useCreateQuestion,
  useUpdateQuestion, useDeleteQuestion, useListAdminStudents, getListAdminStudentsQueryKey,
  useUpdateAdminStudent,
  type Grade, type Subject, type Unit, type Lesson, type AdminQuestion, type AdminStudent,
  type QuizQuestion, type GradeInput, type SubjectInput, type UnitInput, type LessonInput,
  type QuestionInput, type StudentUpdate
} from '@workspace/api-client-react';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 20_000 } } });
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const appearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#255f50',
    colorForeground: '#24433b',
    colorMutedForeground: '#6b7c73',
    colorDanger: '#bd5146',
    colorBackground: '#fbf8ef',
    colorInput: '#fffdf7',
    colorInputForeground: '#24433b',
    colorNeutral: '#d9d1c2',
    fontFamily: "'Noto Sans Arabic', sans-serif",
    borderRadius: '14px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fbf8ef] rounded-2xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#24433b] font-bold',
    headerSubtitle: 'text-[#6b7c73]',
    socialButtonsBlockButtonText: 'text-[#24433b] font-semibold',
    formFieldLabel: 'text-[#24433b] font-semibold',
    footerActionLink: 'text-[#255f50] font-bold',
    footerActionText: 'text-[#6b7c73]',
    dividerText: 'text-[#6b7c73]',
    identityPreviewEditButton: 'text-[#255f50]',
    formFieldSuccessText: 'text-[#255f50]',
    alertText: 'text-[#9c4038]',
    logoBox: 'mb-3',
    logoImage: 'max-h-12',
    socialButtonsBlockButton: 'border-[#d9d1c2] bg-[#fffdf7] rounded-xl',
    formButtonPrimary: 'bg-[#255f50] hover:bg-[#194b3e] rounded-xl',
    formFieldInput: 'bg-[#fffdf7] border-[#d9d1c2] rounded-xl text-[#24433b]',
    footerAction: 'text-[#6b7c73]',
    dividerLine: 'bg-[#e3dccf]',
    alert: 'bg-[#fff0ed] border-[#efc9c1]',
    otpCodeFieldInput: 'bg-[#fffdf7] border-[#d9d1c2]',
    formFieldRow: 'mb-4',
    main: 'gap-5',
  },
};

const links = [
  { href: '/dashboard', label: 'الرئيسية', icon: House },
  { href: '/curriculum', label: 'المناهج', icon: BookOpen },
  { href: '/progress', label: 'تقدّمي', icon: Activity },
  { href: '/leaderboard', label: 'لوحة المتصدرين', icon: Trophy },
  { href: '/admin', label: 'إدارة المحتوى', icon: ShieldAlert },
];
const contentLabel: Record<string, string> = { draft: 'مسودة · غير متحقق', reviewed: 'قيد المراجعة', verified: 'متحقق' };

function Status({ value }: { value: string }) {
  const state = value in contentLabel ? value : 'draft';
  return <span className={`status status-${state}`} data-testid={`status-content-${state}`}>{contentLabel[state]}</span>;
}

function Brand() {
  return <Link href="/" className="brand" data-testid="link-brand">
    <span className="brand-mark" aria-hidden="true">ت</span>
    <span><strong>تَفَوُّق</strong><small>رفيقك في التعلّم</small></span>
  </Link>;
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const [location] = useLocation();
  return <nav className={mobile ? 'mobile-nav' : 'nav-list'} aria-label="التنقل الرئيسي">
    {links.map(({ href, label, icon: Icon }) => {
      const active = location === href || (href !== '/dashboard' && location.startsWith(href));
      return <Link key={href} href={href} className={`nav-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} data-testid={`link-nav-${href.slice(1)}`}>
        <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
      </Link>;
    })}
  </nav>;
}

function ClerkCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const id = user?.id ?? null;
    if (previous.current !== undefined && previous.current !== id) qc.clear();
    previous.current = id;
  }), [addListener, qc]);
  return null;
}

/** Clerk قد لا يتاح تحميله في النشر الثابت؛ نعتبره غير جاهز بعد مهلة قصيرة. */
function useClerkReady(isLoaded: boolean): boolean {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (isLoaded || timedOut) return;
    const timer = window.setTimeout(() => setTimedOut(true), 2500);
    return () => window.clearTimeout(timer);
  }, [isLoaded, timedOut]);
  return isLoaded || timedOut;
}

function useLocalStudent(): LocalStudent | null {
  const [student, setStudent] = useState<LocalStudent | null>(() => readLocalStudent());
  useEffect(() => {
    const sync = () => setStudent(readLocalStudent());
    window.addEventListener('tafaweq:session-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('tafaweq:session-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return student;
}

/** بديل محلي لبطاقة الدخول يعمل بلا خدمة سحابية ويحفظ تقدّم الطالب على جهازه. */
function LocalSignInCard({ mode }: { mode: 'in' | 'up' }) {
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    saveLocalStudent(name);
    navigate('/dashboard');
  };
  return <div className="card" style={{ padding: 24, width: '100%', maxWidth: 420 }} dir="rtl" data-testid="card-local-sign-in">
    <h2 style={{ marginBottom: 8 }}>{mode === 'in' ? 'دخول الطالب' : 'إنشاء حساب طالب'}</h2>
    <p className="row-meta" style={{ marginBottom: 16 }}>اكتب اسمك لمتابعة دروسك وحفظ تقدّمك على هذا الجهاز.</p>
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <label className="field"><span>اسم الطالب</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: أحمد" required data-testid="input-local-name" />
      </label>
      <button type="submit" className="btn btn-primary" data-testid="button-local-submit">{mode === 'in' ? 'متابعة التعلّم' : 'ابدأ الآن'}</button>
      <Link href="/math" className="btn btn-quiet" data-testid="link-local-math">تصفّح رياضيات الصف العاشر</Link>
    </form>
  </div>;
}

function AuthWidget({ mode }: { mode: 'in' | 'up' }) {
  const { isLoaded } = useAuth();
  const clerkReady = useClerkReady(isLoaded);
  const localStudent = useLocalStudent();
  if (!CLERK_ENABLED || !clerkReady || localStudent) return <LocalSignInCard mode={mode} />;
  return mode === 'in'
    ? <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    : <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />;
}

function AuthPages() {
  return <Switch>
    <Route path="/sign-in/*?">
      <div className="auth-frame" dir="rtl">
        <div className="auth-copy"><Brand /><div><span className="eyebrow">خطوتك الأولى</span><h1>كل درس صغير، يقربك من هدفك.</h1><p>مساحة آمنة لتتعلم، تتدرّب، وتتابع تقدّمك خطوة بخطوة.</p></div></div>
        <div className="auth-widget"><AuthWidget mode="in" /></div>
      </div>
    </Route>
    <Route path="/sign-up/*?">
      <div className="auth-frame" dir="rtl">
        <div className="auth-copy"><Brand /><div><span className="eyebrow">مسارك يبدأ هنا</span><h1>تعلّم على مهل. تقدّم بثقة.</h1><p>اختر صفك، واستكشف الدروس والتمارين المرتبطة بها.</p></div></div>
        <div className="auth-widget"><AuthWidget mode="up" /></div>
      </div>
    </Route>
  </Switch>;
}

function AppShell({ children }: { children: ReactNode }) {
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  const localStudent = useLocalStudent();
  const clerkReady = useClerkReady(isLoaded);
  const [location, navigate] = useLocation();
  if (CLERK_ENABLED && !clerkReady) return <PageLoading />;
  // تصفّح المنهاج (صفوف ← مواد ← فصل ← وحدات ← دروس) متاح للزائر بلا حساب،
  // بينما تبقى مساحات التقدّم والاختبارات والإدارة للمسجلين.
  const guestBrowse = /^\/(curriculum|math)(\/|$)/.test(location);
  if (!isSignedIn && !localStudent && !guestBrowse) return <Unauthorized />;
  const handleSignOut = () => {
    if (localStudent) {
      clearLocalStudent();
      navigate('/');
      return;
    }
    void signOut({ redirectUrl: basePath || '/' });
  };
  return <div className="shell" dir="rtl">
    <aside className="sidebar">
      <Brand />
      <div><div className="nav-caption">مساحة التعلّم</div><NavLinks /></div>
      <div className="sidebar-foot">
        {isSignedIn || localStudent ? <button type="button" className="nav-link" onClick={handleSignOut} data-testid="button-sign-out"><LogOut size={18} /><span>تسجيل الخروج</span></button> : <Link className="nav-link" href="/sign-in" data-testid="button-guest-sign-in"><span>تسجيل الدخول للتدرب</span></Link>}
        <p style={{ fontSize: 10, opacity: .55, padding: '0 13px', lineHeight: 1.8 }}>المحتوى غير المتحقق يظهر بوضوح قبل البدء.</p>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-date">منصتك التعليمية · الأردن</div><div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><Link className="btn btn-quiet" href="/curriculum" data-testid="link-top-curriculum"><BookOpen size={16} /> تصفّح المنهاج</Link><Link className="btn btn-primary" href="/math" data-testid="link-top-math"><BookOpen size={16} /> رياضيات الصف العاشر</Link></div></header>
      <div className="content">{children}</div>
    </main>
    <NavLinks mobile />
  </div>;
}

function PageLoading() {
  return <main className="main-area" dir="rtl" aria-live="polite" data-testid="state-loading"><div className="content"><div className="skeleton-box card"><div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line" /></div></div></main>;
}

function Unauthorized() {
  return <main className="main-area" dir="rtl"><div className="content card empty" data-testid="state-unauthorized"><div className="empty-mark"><ShieldAlert /></div><h3>هذه المساحة للطلاب المسجلين</h3><p>سجّل الدخول لمتابعة دروسك وتقدّمك. يمكنك استكشاف فكرة المنصة من الصفحة الرئيسية.</p><Link href="/sign-in" className="btn btn-primary" data-testid="link-unauthorized-sign-in">تسجيل الدخول</Link></div></main>;
}

function ErrorState({ retry, message = 'تعذّر تحميل البيانات الآن.' }: { retry: () => void; message?: string }) {
  return <div className="card error-box" role="alert" data-testid="state-error"><div className="empty-mark"><CircleHelp /></div><h3>لم نتمكن من إكمال الطلب</h3><p>{message}</p><button className="btn btn-primary" type="button" onClick={retry} data-testid="button-retry"><RefreshCw size={15} /> حاول مرة أخرى</button></div>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="card empty" data-testid="state-empty"><div className="empty-mark"><BookOpen size={23} /></div><h3>{title}</h3><p>{body}</p></div>;
}

function PageIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return <header className="fade-in"><span className="eyebrow">{eyebrow}</span><h1 className="page-title">{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</header>;
}

function Home() {
  const { isSignedIn } = useAuth();
  const localStudent = useLocalStudent();
  if (isSignedIn || localStudent) return <Redirect to="/dashboard" />;
  return <main dir="rtl" style={{ minHeight: '100dvh' }}>
    <header style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Brand /><div style={{ display: 'flex', gap: 10 }}><Link className="btn btn-quiet" href="/sign-in" data-testid="link-home-sign-in">دخول الطلاب</Link><Link className="btn btn-primary" href="/sign-up" data-testid="link-home-sign-up">ابدأ التعلّم <ArrowLeft size={16} /></Link></div></header>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 22px 80px' }}>
      <section className="hero-panel fade-in" style={{ minHeight: 360, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span className="eyebrow" style={{ color: 'hsl(38 75% 75%)' }}>تعلّمك، على طريقتك</span>
        <h1>من درس اليوم<br />إلى إنجازك القادم.</h1>
        <p>منصة تعليمية للطلبة في الأردن، تربط كل تدريب بالدرس الذي يعلّمك إياه. تقدّم واضح، وخطوة صغيرة كل يوم.</p>
        <div style={{ display: 'flex', gap: 11, marginTop: 13, flexWrap: 'wrap' }}><Link href="/sign-up" className="btn btn-soft" data-testid="link-hero-sign-up">أنشئ حسابك <ArrowLeft size={16} /></Link><Link href="/curriculum" className="btn btn-quiet" style={{ color: 'inherit', borderColor: 'rgba(255,255,255,.3)' }} data-testid="link-hero-curriculum">استكشف الصفوف</Link></div>
        <div style={{ marginTop: 26, fontSize: 11, opacity: .72 }} data-testid="text-home-content-note">تُعرض حالة التحقق لكل محتوى قبل التعلّم.</div>
      </section>
      <section style={{ padding: '54px 0 22px' }}><PageIntro eyebrow="كيف تبدأ" title="مسار واضح من البداية" subtitle="لا نخلط التدريب بالمحتوى: كل سؤال يبقى ضمن درسه، وحالة المصدر ظاهرة لك." />
        <div className="tile-grid" style={{ marginTop: 22 }}>
          {[['01','اختر صفك','تصفّح مواد المنهاج والوحدات المتاحة.'],['02','افهم الدرس','اقرأ الأهداف والشرح وحالة المصدر.'],['03','تدرّب وتابع','اختبر فهمك، ثم راجع تقدّمك.']].map(([n,t,d])=><article className="card tile" key={n} data-testid={`card-home-step-${n}`}><div className="tile-icon mono">{n}</div><div className="tile-copy"><h3>{t}</h3><p>{d}</p></div></article>)}
        </div>
      </section>
      <section className="banner" style={{ marginTop: 34 }}><ShieldAlert size={19} /><div><strong>وضوح قبل كل شيء</strong><br />أي مادة لم يتم التحقق منها تظهر كمسودة أو قيد المراجعة، ولا تُقدَّم على أنها محتوى رسمي.</div></section>
      <footer style={{ marginTop: 48, borderTop: '1px solid hsl(var(--border))', paddingTop: 20, color: 'hsl(var(--muted-foreground))', fontSize: 12 }}>تفوّق · رفيقك في التعلّم · الأردن</footer>
    </div>
  </main>;
}

function Dashboard() {
  const query = useGetMyDashboard({ query: { queryKey: getGetMyDashboardQueryKey() } });
  const profileQuery = useGetMyProfile({ query: { queryKey: getGetMyProfileQueryKey() } });
  const profileUpdate = useUpdateMyProfile();
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const qc = useQueryClient();
  const [editProfile, setEditProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [gradeId, setGradeId] = useState('');
  const gradesQ = useListGrades({ query: { queryKey: getListGradesQueryKey() } });
  const dashboard = query.data;
  if (query.isLoading) return <PageLoading />;
  if (query.isError || !dashboard) return <ErrorState retry={() => { query.refetch(); health.refetch(); }} />;
  const { profile, dailyGoal } = dashboard;
  const goalPct = Math.min(100, Math.round((dailyGoal.completedLessons / Math.max(1, dailyGoal.targetLessons)) * 100));
  return <AppShell><div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'end', flexWrap:'wrap' }}><PageIntro eyebrow={`أهلًا ${profile.displayName}`} title="مساحة تعلّمك" subtitle={`${profile.gradeTitle ?? 'الصف غير محدد'} · واصل تقدّمك بخطوات هادئة وواضحة.`} /><button className="btn btn-quiet" onClick={()=>{setDisplayName(profileQuery.data?.displayName ?? profile.displayName);setGradeId(profileQuery.data?.gradeId?.toString() ?? '');setEditProfile(true);}} data-testid="button-edit-profile"><Pencil size={15}/> تعديل الملف</button></div>
    {dashboard.contentNotice && <div className="banner" style={{ marginTop: 20 }} data-testid="text-content-notice"><ShieldAlert size={18} /><span>{dashboard.contentNotice}</span></div>}
    <div className="hero-panel" style={{ marginTop: 24 }} data-testid="panel-daily-goal"><span className="eyebrow" style={{ color: 'hsl(38 75% 75%)' }}>هدف اليوم</span><h1 style={{ fontSize: 30 }}>كل خطوة تُحسب.</h1><p>{dailyGoal.completedLessons} من {dailyGoal.targetLessons} دروس مكتملة اليوم · {dailyGoal.xpEarned} من {dailyGoal.targetXp} نقطة خبرة</p><div className="progress-track" style={{ background: 'rgba(255,255,255,.2)', maxWidth: 500, marginTop: 18 }}><div className="progress-fill" style={{ width: `${goalPct}%`, background: 'hsl(38 75% 72%)' }} /></div></div>
    <div className="grid grid-stats" style={{ marginTop: 17 }}><Stat label="الدروس المكتملة" value={`${dashboard.completedLessons} / ${dashboard.totalLessons}`} icon={<BookOpenCheck />} /><Stat label="نقاط الخبرة" value={profile.totalXp} icon={<Zap />} /><Stat label="المستوى" value={profile.level} icon={<Award />} /><Stat label="أيام الاستمرار" value={profile.streakDays} icon={<Activity />} /></div>
    <section><div className="section-heading"><h2>أكمل من حيث توقفت</h2><Link href="/curriculum" className="btn btn-quiet" data-testid="link-dashboard-curriculum">عرض المنهاج <ArrowLeft size={15} /></Link></div>
      {dashboard.continueLearning.length ? <div className="list-stack">{dashboard.continueLearning.map(lesson=><LessonRow key={lesson.id} lesson={lesson} />)}</div> : <EmptyState title="لا توجد دروس للمتابعة بعد" body="اختر صفك من المنهاج لعرض الدروس المرتبطة به." />}</section>
    <section><div className="section-heading"><h2>آخر نشاط</h2><Link href="/progress" className="btn btn-quiet" data-testid="link-dashboard-progress">كل التقدّم <ArrowLeft size={15} /></Link></div>
      {dashboard.recentActivity.length ? <div className="list-stack">{dashboard.recentActivity.map(act=><article className="card row-card" key={act.id} data-testid={`activity-${act.id}`}><div className="row-main"><div className="row-title">{act.summary}</div><div className="row-meta">{new Date(act.happenedAt).toLocaleDateString('ar-JO')}</div></div><span className="status status-reviewed">+{act.xpEarned} XP</span></article>)}</div> : <EmptyState title="سيظهر نشاطك هنا" body="بعد إنهاء درس أو اختبار، ستجد ملخص خطواتك الأخيرة." />}</section>
     <section><div className="section-heading"><h2>أوسمتك</h2><span className="row-meta">إنجازات محفوظة في حسابك</span></div>
       {dashboard.achievements.length ? <div className="tile-grid">{dashboard.achievements.map(badge=><article className="card tile" key={badge.code} data-testid={`achievement-${badge.code}`}><div className="tile-icon"><Award size={21}/></div><div className="tile-copy"><h3>{badge.title}</h3><p>{badge.description}</p><small className="row-meta">{new Date(badge.earnedAt).toLocaleDateString('ar-JO')}</small></div></article>)}</div> : <EmptyState title="أوسمتك الأولى بانتظارك" body="أكمل اختبارًا أو درسًا لتحصل على إنجاز محفوظ في ملفك." />}</section>
    {editProfile && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title" dir="rtl"><div className="modal-head"><div><span className="eyebrow">ملفي</span><h2 id="profile-dialog-title" style={{margin:'6px 0'}}>تحديث بيانات التعلّم</h2></div><button className="icon-btn" onClick={()=>setEditProfile(false)} aria-label="إغلاق" data-testid="button-close-profile"><X size={20}/></button></div><label className="field"><span>الاسم الظاهر</span><input value={displayName} onChange={e=>setDisplayName(e.target.value)} data-testid="input-profile-name"/></label><label className="field"><span>الصف الدراسي</span><select value={gradeId} onChange={e=>setGradeId(e.target.value)} data-testid="select-profile-grade"><option value="">بدون تحديد</option>{(gradesQ.data ?? []).map(grade=><option key={grade.id} value={grade.id}>{grade.title}</option>)}</select></label>{profileUpdate.isError && <p role="alert">تعذر تحديث الملف الشخصي.</p>}<div style={{display:'flex',gap:10,justifyContent:'flex-start'}}><button className="btn btn-primary" disabled={profileUpdate.isPending || !displayName.trim()} onClick={()=>profileUpdate.mutate({data:{displayName:displayName.trim(),gradeId:gradeId?Number(gradeId):null}},{onSuccess:()=>{void qc.invalidateQueries({queryKey:getGetMyProfileQueryKey()});void qc.invalidateQueries({queryKey:getGetMyDashboardQueryKey()});setEditProfile(false);}})} data-testid="button-save-profile">{profileUpdate.isPending?'جارٍ الحفظ...':'حفظ التغييرات'}</button><button className="btn btn-quiet" onClick={()=>setEditProfile(false)} data-testid="button-cancel-profile">إلغاء</button></div></section></div>}
  </AppShell>;
}

function Stat({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return <article className="card stat-card" data-testid={`stat-${label}`}><div style={{ display:'flex', justifyContent:'space-between', color:'hsl(var(--muted-foreground))' }}><span className="stat-label">{label}</span>{icon}</div><div className="stat-value" data-testid={`value-${label}`}>{value}</div></article>;
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  return <article className="card row-card" data-testid={`lesson-row-${lesson.id}`}><div className="row-main"><div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}><span className="row-title">{lesson.title}</span><Status value={lesson.contentStatus} /></div><div className="row-meta">{lesson.subjectTitle} · الوحدة: {lesson.unitTitle} · {lesson.durationMinutes} دقيقة{lesson.bestScore !== null ? ` · أفضل نتيجة ${lesson.bestScore}%` : ''}</div></div><Link href={`/lessons/${lesson.id}`} className="btn btn-primary" data-testid={`link-open-lesson-${lesson.id}`}>افتح الدرس <ArrowLeft size={15} /></Link></article>;
}

import { BOOK_STATUS_LABEL, booksOfSubject, curriculumCompletion } from './lib/official-books';
import { outlineFor } from './data/imported-outlines';

function BooksInventory() {
  const completion = curriculumCompletion();
  return <AppShell><Breadcrumb href="/curriculum" label="المنهاج" /><PageIntro eyebrow="سجل الكتب" title="كتب المناهج الأردنية" subtitle="حالة كل كتاب رسمي لكل صف ومادة وفصل: مربوط بمحتواه، أو بانتظار الاستيراد من المصدر الرسمي." />
    <div className="card" style={{ marginTop: 22 }} data-testid="panel-books-totals">
      <p className="row-meta">الصفوف {completion.totals.subjects ? completion.grades.length : 0} · المواد {completion.totals.subjects} · كتب الفصلين {completion.totals.books} · مربوطة {completion.totals.booksLinked} · بانتظار الاستيراد {completion.totals.booksPending}</p>
      <p className="row-meta">الوحدات {completion.totals.units} · الدروس {completion.totals.lessons} · الأسئلة {completion.totals.questions}</p>
      <p className="row-meta" data-testid="text-books-rule">لا يُعرض أي درس أو سؤال غير مستورد من كتاب رسمي؛ الكتب غير المتاحة تظهر بحالة «بانتظار الاستيراد» مع رابط صفحة الكتب الرسمية.</p>
    </div>
    <div className="list-stack" style={{ marginTop: 22 }}>
      {completion.grades.map(row => <article className="card row-card" key={row.gradeNumber} data-testid={`book-row-grade-${row.gradeNumber}`}>
        <div className="row-main">
          <div className="row-title">الصف {row.gradeNumber} — {row.stage}</div>
          <div className="row-meta">{row.subjects} مواد · {row.booksLinked} كتاب مربوط من {row.books} · {row.units} وحدة · {row.lessons} درسًا · {row.questions} سؤالًا</div>
        </div>
        <a className="btn btn-quiet" href={row.sourcePage} target="_blank" rel="noreferrer noopener" data-testid={`link-grade-source-${row.gradeNumber}`}>صفحة الكتب الرسمية</a>
      </article>)}
    </div>
  </AppShell>;
}

function Curriculum() {
  const q = useListGrades({ query: { queryKey: getListGradesQueryKey() } });
  const [search, setSearch] = useState('');
  if (q.isLoading) return <PageLoading />;
  if (q.isError) return <AppShell><ErrorState retry={() => q.refetch()} /></AppShell>;
  const grades = (q.data ?? []).filter(g => `${g.title} ${g.stage} ${g.gradeNumber}`.includes(search));
  const books = curriculumCompletion();
  return <AppShell><PageIntro eyebrow="المنهاج" title="اختر صفك الدراسي" subtitle="استكشف المواد والوحدات والدروس، مع حالة المحتوى موضحة بوضوح." />
    <div className="card" style={{ marginTop: 22 }} data-testid="panel-books-summary">
      <div className="section-heading" style={{ marginTop: 0 }}><h2>حالة الكتب المدرسية</h2><Link href="/curriculum/books" className="btn btn-quiet" data-testid="link-books-inventory">سجل الكتب <ArrowLeft size={15} /></Link></div>
      <p className="row-meta">الصفوف {books.grades.length} · المواد {books.totals.subjects} · كتب الفصلين {books.totals.books} · مربوطة {books.totals.booksLinked} · بانتظار الاستيراد {books.totals.booksPending}</p>
    </div>
    <div className="toolbar"><label className="field" style={{ margin: 0, minWidth: 250 }}><span className="sr-only">ابحث عن صف</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن الصف..." data-testid="input-search-grades" /></label></div>
    {grades.length ? <div className="tile-grid">{grades.map(g=><Link href={`/curriculum/grade/${g.id}`} key={g.id} className="card tile" data-testid={`card-grade-${g.id}`}><div className="tile-icon"><GraduationCap size={22} /></div><div className="tile-copy"><h3>{g.title}</h3><p>{g.stage} · {g.subjectCount} مواد</p><div style={{ marginTop: 12 }}><Status value={g.contentStatus} /></div></div><ChevronLeft size={18} /></Link>)}</div> : <EmptyState title="لا توجد صفوف مطابقة" body="جرّب كلمة بحث أخرى أو عد إلى قائمة الصفوف." />}
  </AppShell>;
}

function GradeSubjects() {
  const [, params] = useRoute('/curriculum/grade/:gradeId');
  const id = Number(params?.gradeId || 0);
  const gradesQ = useListGrades({ query: { queryKey: getListGradesQueryKey() } });
  const q = useListGradeSubjects(id, { query: { queryKey: getListGradeSubjectsQueryKey(id), enabled: !!id } });
  if (q.isLoading) return <PageLoading />;
  if (q.isError) return <AppShell><ErrorState retry={() => q.refetch()} /></AppShell>;
  const grade = gradesQ.data?.find(g=>g.id===id);
  return <AppShell><Breadcrumb href="/curriculum" label="الصفوف" /><PageIntro eyebrow={grade?.stage ?? 'المنهاج'} title={grade?.title ?? 'مواد الصف'} subtitle="اختر مادة لعرض وحداتها ودروسها." />
    {(q.data ?? []).length ? <div className="tile-grid" style={{ marginTop: 26 }}>{q.data?.map(s=><Link key={s.id} href={`/curriculum/subject/${s.id}`} className="card tile" data-testid={`card-subject-${s.id}`}><div className="tile-icon"><BookOpen size={22} /></div><div className="tile-copy"><h3>{s.title}</h3><p>{s.description || 'وحدات ودروس المنهاج'}</p><p style={{ marginTop: 8 }} data-testid={`subject-units-${s.id}`}>{s.unitCount ? `${s.unitCount} وحدات` : 'لم يُضف الكتاب بعد'}</p></div><ChevronLeft size={18} /></Link>)}</div> : <EmptyState title="لا توجد مواد متاحة بعد" body="لم تتم إضافة مواد لهذا الصف حتى الآن." />}
  </AppShell>;
}

function SubjectUnits() {
  const [, params] = useRoute('/curriculum/subject/:subjectId');
  const id = Number(params?.subjectId || 0);
  const q = useListSubjectUnits(id, { query: { queryKey: getListSubjectUnitsQueryKey(id), enabled: !!id } });
  const [semester, setSemester] = useState<1 | 2>(1);
  const subjectBooks = booksOfSubject(id);
  const subjectInfo = subjectBooks[0];
  const outline = subjectInfo ? outlineFor(subjectInfo.gradeNumber, subjectInfo.subjectTitle, semester) : undefined;
  if (q.isLoading) return <PageLoading />;
  if (q.isError) return <AppShell><ErrorState retry={() => q.refetch()} /></AppShell>;
  // رقم الفصل الدراسي يأتي من البيانات؛ أي قيمة غير معروفة تُعامل كالفصل الأول.
  const semesterOf = (unit: unknown) =>
    (unit as { semester?: number | null } | null)?.semester === 2 ? 2 : 1;
  const units = q.data ?? [];
  const visible = units.filter(unit => semesterOf(unit) === semester);
  const countOf = (value: 1 | 2) => units.filter(unit => semesterOf(unit) === value).length;
  return <AppShell><Breadcrumb href="/curriculum" label="المنهاج" /><PageIntro eyebrow="المواد" title="وحدات المادة" subtitle="اختر الفصل الدراسي، ثم الوحدة للانتقال إلى دروسها." />
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 14, marginTop: 22 }} data-testid="panel-subject-books">
      {subjectBooks.map(book => <article className="card" key={book.key} data-testid={`book-card-${book.semester}`}>
        <span className="eyebrow">الفصل {book.semester === 1 ? 'الأول' : 'الثاني'}</span>
        <h3 style={{ fontSize: 17, marginTop: 8 }}>{book.title}</h3>
        <p className="row-meta">{book.status === 'linked' ? `${book.units} وحدات · ${book.lessons} درسًا · ${book.questions} سؤالًا` : book.status === 'outline-imported' ? `${book.units} وحدات · ${book.lessons} درسًا مستوردة · الأسئلة قيد الإعداد` : book.status === 'outline-unverified' ? 'وحدات الكتاب معروضة أدناه · تقسيم الفصل غير موثق في المصدر · الأسئلة قيد الإعداد' : 'بانتظار استيراد وحدات ودروس الكتاب الرسمي'}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={book.status === 'linked' ? 'status status-reviewed' : 'status status-draft'} data-testid={`book-status-${book.semester}`} data-status={book.status}>{BOOK_STATUS_LABEL[book.status]}</span>
          <a className="btn btn-quiet" href={book.sourcePage} target="_blank" rel="noreferrer noopener" data-testid={`book-source-${book.semester}`}>المصدر الرسمي</a>
        </div>
      </article>)}
    </div>
    <div className="toolbar" style={{ marginTop: 22 }} role="tablist" aria-label="الفصل الدراسي">
      {([1, 2] as const).map(value => <button key={value} type="button" role="tab" aria-selected={semester === value} onClick={() => setSemester(value)} className={`btn ${semester === value ? 'btn-primary' : 'btn-quiet'}`} data-testid={`tab-semester-${value}`}>الفصل الدراسي {value === 1 ? 'الأول' : 'الثاني'} ({countOf(value)})</button>)}
    </div>
    {outline ? <div className="list-stack" style={{ marginTop: 18 }} data-testid="outline-units">
      <p className="row-meta" data-testid="outline-note">وحدات ودروس كتاب {outline.bookTitle} مستوردة من مصدر أردني ({outline.sourceName}).{outline.semesterVerified ? '' : ' المصدر لا يحدد تقسيم هذه الوحدات على الفصلين الدراسيين، لذا تُعرض كاملة دون نسبتها إلى فصل معيّن.'} الأسئلة لم تُكتب لهذا الكتاب بعد.</p>
      {outline.units.map(unit => <article className="card" key={unit.number} data-testid={`outline-unit-${unit.number}`}>
        <div className="row-main">
          <div className="row-title">الوحدة {unit.number}: {unit.title}</div>
          <div className="row-meta">{unit.lessons.length} دروس</div>
        </div>
        <ul style={{ marginTop: 10, paddingInlineStart: 18 }}>
          {unit.lessons.map(lesson => <li key={lesson.title} style={{ marginTop: 6 }}>
            {lesson.sourceUrl ? <a href={lesson.sourceUrl} target="_blank" rel="noreferrer noopener">{lesson.title}</a> : lesson.title}
          </li>)}
        </ul>
      </article>)}
    </div> : null}
    {visible.length ? <div className="list-stack" style={{ marginTop: 25 }}>{visible.map(unit=><Link key={unit.id} href={`/curriculum/unit/${unit.id}`} className="card row-card" style={{ textDecoration:'none', color:'inherit' }} data-testid={`row-unit-${unit.id}`}><div className="row-main"><div className="row-title">{unit.position + 1}. {unit.title}</div><div className="row-meta">{unit.lessonCount} دروس · الفصل {semester === 1 ? 'الأول' : 'الثاني'}</div></div><Status value={unit.contentStatus} /><ChevronLeft size={18} /></Link>)}</div> : <EmptyState title="لا توجد وحدات في هذا الفصل" body={units.length ? 'اختر الفصل الدراسي الآخر لعرض وحداته.' : outline ? 'وحدات الكتاب المستوردة معروضة أعلاه، وأسئلتها قيد الإعداد.' : 'لم يُضف كتاب هذه المادة بعد؛ ستظهر وحداتها عند ربط الكتاب الرسمي.'} />}
  </AppShell>;
}

function UnitLessons() {
  const [, params] = useRoute('/curriculum/unit/:unitId');
  const id = Number(params?.unitId || 0);
  const q = useListUnitLessons(id, { query: { queryKey: getListUnitLessonsQueryKey(id), enabled: !!id } });
  if (q.isLoading) return <PageLoading />;
  if (q.isError) return <AppShell><ErrorState retry={() => q.refetch()} /></AppShell>;
  const unit = q.data?.[0]?.unitTitle;
  return <AppShell><Breadcrumb href="/curriculum" label="المنهاج" /><PageIntro eyebrow="الوحدات" title={unit ?? 'دروس الوحدة'} subtitle="ابدأ بشرح الدرس، ثم انتقل إلى اختبار مرتبط به." />
    {(q.data ?? []).length ? <div className="list-stack" style={{ marginTop: 25 }}>{q.data?.map(l=><LessonRow key={l.id} lesson={l} />)}</div> : <EmptyState title="الوحدة فارغة حاليًا" body="لا توجد دروس في هذه الوحدة بعد." />}
  </AppShell>;
}

function Breadcrumb({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="btn btn-quiet" style={{ marginBottom: 18 }} data-testid="link-breadcrumb"><ArrowRight size={15} /> {label}</Link>;
}

function LessonPage() {
  const [, params] = useRoute('/lessons/:lessonId');
  const id = Number(params?.lessonId || 0);
  const q = useGetLesson(id, { query: { queryKey: getGetLessonQueryKey(id), enabled: !!id } });
  const quizQ = useGetLessonQuiz(id, { query: { queryKey: getGetLessonQuizQueryKey(id), enabled: !!id } });
  if (q.isLoading || quizQ.isLoading) return <PageLoading />;
  if (q.isError || !q.data) return <AppShell><ErrorState retry={() => q.refetch()} /></AppShell>;
  const lesson = q.data;
  const questions = quizQ.data ?? [];
  return <AppShell><Breadcrumb href={`/curriculum/unit/${lesson.unitId}`} label={lesson.unitTitle} />
    <div className="card" style={{ padding: 'clamp(22px,4vw,42px)' }} data-testid={`lesson-detail-${lesson.id}`}>
      <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', flexWrap:'wrap' }}><span className="eyebrow">{lesson.subjectTitle} · الصف {lesson.gradeNumber}</span><Status value={lesson.contentStatus} /></div>
      <h1 className="page-title" style={{ marginTop:15 }}>{lesson.title}</h1><p className="page-subtitle">{lesson.description}</p>
      <div className="banner" style={{ marginTop:20 }} data-testid="lesson-source-status"><ShieldAlert size={18} /><div><strong>حالة المصدر: {contentLabel[lesson.contentStatus] ?? contentLabel.draft}</strong><br />{lesson.sourceReference ? `مرجع المحتوى: ${lesson.sourceReference}` : 'لا يوجد مرجع مصدر موثق لهذا المحتوى. لا يُعرض على أنه مادة رسمية.'}</div></div>
      <section style={{ marginTop:30 }}><span className="eyebrow">هدف الدرس</span><h2 style={{ fontSize:20 }}>{lesson.objective}</h2></section>
      <section style={{ marginTop:24 }}><div className="section-heading" style={{ marginTop:0 }}><h2>ماذا ستتعلّم؟</h2><span className="row-meta"><Clock3 size={14} style={{ verticalAlign:'middle' }} /> {lesson.durationMinutes} دقيقة</span></div><ul style={{ lineHeight:2.2 }}>{lesson.objectives.map((obj,i)=><li key={`${i}-${obj}`} data-testid={`objective-${i}`}>{obj}</li>)}</ul></section>
      <section style={{ marginTop:24 }}><h2 style={{ fontSize:19 }}>الشرح</h2><div className="prose" style={{ lineHeight:2, whiteSpace:'pre-line' }} data-testid="lesson-explanation">{lesson.explanation}</div></section>
      <section style={{ marginTop:24 }} data-testid="lesson-questions"><div className="section-heading" style={{ marginTop:0 }}><h2>أسئلة الدرس التفاعلية</h2><span className="row-meta">{questions.length} أسئلة · تصحيح فوري</span></div>{questions.length ? <LessonPractice lessonId={lesson.id} questions={questions} /> : <p className="row-meta">لم تُضف أسئلة لهذا الدرس بعد.</p>}</section>
      <div style={{ display:'flex', gap:10, marginTop:30, flexWrap:'wrap' }}><Link href={`/lessons/${lesson.id}/quiz`} className="btn btn-primary" data-testid={`link-lesson-quiz-${lesson.id}`}>اختبار شامل للدرس <ArrowLeft size={16} /></Link><Link href={`/curriculum/unit/${lesson.unitId}`} className="btn btn-quiet" data-testid="link-back-to-lessons">العودة للدروس</Link></div>
    </div>
  </AppShell>;
}

function QuizPage() {
  const [, params] = useRoute('/lessons/:lessonId/quiz');
  const lessonId = Number(params?.lessonId || 0);
  const q = useGetLessonQuiz(lessonId, { query: { queryKey: getGetLessonQuizQueryKey(lessonId), enabled: !!lessonId } });
  const lessonQ = useGetLesson(lessonId, { query: { queryKey: getGetLessonQueryKey(lessonId), enabled: !!lessonId } });
  const submit = useSubmitQuizAttempt();
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<Awaited<ReturnType<typeof submit.mutateAsync>> | null>(null);
  const questions = q.data ?? [];
  const onSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) return;
    try {
      const response = await submit.mutateAsync({ data: { lessonId, answers: questions.map(question=>({ questionId: question.id, selectedOption: answers[question.id] })) } });
      setResult(response);
      void qc.invalidateQueries({ queryKey: getGetMyDashboardQueryKey() });
      void qc.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
      void qc.invalidateQueries({ queryKey: getGetLessonQueryKey(lessonId) });
    } catch { /* mutation error is rendered below */ }
  };
  if (q.isLoading || lessonQ.isLoading) return <PageLoading />;
  if (q.isError || lessonQ.isError) return <AppShell><ErrorState retry={() => { q.refetch(); lessonQ.refetch(); }} /></AppShell>;
  const lesson = lessonQ.data;
  return <AppShell><div className="quiz-layout"><Breadcrumb href={`/lessons/${lessonId}`} label={lesson?.title ?? 'الدرس'} />
    {lesson?.contentStatus !== 'verified' && <div className="banner" style={{ marginBottom:16 }}><ShieldAlert size={17} /><span>هذا المحتوى {contentLabel[lesson?.contentStatus ?? 'draft']}، وليس مثبتًا كمصدر رسمي.</span></div>}
    {!questions.length ? <EmptyState title="لا يوجد اختبار لهذا الدرس" body="لم تتم إضافة أسئلة بعد. يمكنك العودة إلى شرح الدرس." /> :
      <div className="card quiz-box" data-testid={`quiz-for-lesson-${lessonId}`}>
        <span className="eyebrow">اختبار مرتبط بهذا الدرس</span><h1 className="page-title" style={{ fontSize:28 }}>{lesson?.title}</h1>
        <div className="row-meta" style={{ marginBottom:24 }}>السؤال {result ? questions.length : Object.keys(answers).length} من {questions.length}</div>
        {result ? <QuizResults result={result} questions={questions} /> : <div className="list-stack">{questions.map((question,index)=><fieldset key={question.id} style={{ border:0, padding:0, margin:'0 0 24px' }} data-testid={`question-${question.id}`}><legend style={{ fontWeight:750, fontSize:17, lineHeight:1.8, marginBottom:12 }}>{index+1}. <MathText text={question.prompt} /></legend><div className="list-stack">{question.options.map((option,optionIndex)=><button type="button" key={optionIndex} className={`quiz-choice ${answers[question.id]===optionIndex?'selected':''}`} onClick={()=>setAnswers(prev=>({...prev,[question.id]:optionIndex}))} data-testid={`choice-${question.id}-${optionIndex}`}><span className="choice-key">{String.fromCharCode(0x0623+optionIndex)}</span><span><MathText text={option} /></span></button>)}</div></fieldset>)}</div>}
        {!result && <button type="button" className="btn btn-primary" disabled={Object.keys(answers).length!==questions.length || submit.isPending} onClick={onSubmit} data-testid="button-submit-quiz">{submit.isPending ? 'جارٍ تصحيح الإجابات...' : 'أرسل إجاباتي'} <ArrowLeft size={16} /></button>}
        {submit.isError && <p role="alert" style={{ color:'hsl(var(--destructive))' }} data-testid="text-submit-error">لم يتم إرسال الإجابات. تحقق من اتصالك وأعد المحاولة.</p>}
      </div>}
  </div></AppShell>;
}

function QuizResults({ result, questions }: { result: NonNullable<ReturnType<typeof useSubmitQuizAttempt>['data']>; questions: QuizQuestion[] }) {
  return <div data-testid="quiz-results"><div className="hero-panel" style={{ padding:24, marginBottom:20 }}><span className="eyebrow" style={{ color:'hsl(38 75% 75%)' }}>نتيجتك</span><h2 style={{ fontSize:38, margin:'8px 0' }}>{result.scorePercent}%</h2><p style={{ margin:0 }}>{result.correctAnswers} إجابات صحيحة من {result.totalQuestions} · +{result.earnedXp} نقطة خبرة</p></div>
    <div className="list-stack">{result.results.map((answer,index)=>{const question=questions.find(q=>q.id===answer.questionId);return <article className="card" key={answer.questionId} style={{ padding:18 }} data-testid={`answer-result-${answer.questionId}`}><div style={{ display:'flex', alignItems:'center', gap:9 }}><span className="leader-rank">{answer.isCorrect?<Check size={15}/>:<X size={15}/>}</span><strong>{index+1}. <MathText text={answer.prompt} /></strong></div><p className="row-meta" style={{ marginTop:10 }}>{answer.isCorrect?'إجابة صحيحة':'إجابة تحتاج مراجعة'} · <MathText text={answer.explanation} /></p><p className="row-meta"><strong>الإجابة الصحيحة:</strong> <MathText text={question?.options[answer.correctOption] ?? "—"} /></p></article>;})}</div>
  </div>;
}

function Progress() {
  const q = useGetMyProgress({ query: { queryKey: getGetMyProgressQueryKey() } });
  if (q.isLoading) return <PageLoading />;
  if (q.isError) return <AppShell><ErrorState retry={()=>q.refetch()} /></AppShell>;
  return <AppShell><PageIntro eyebrow="تقدّمي" title="كل محاولة تعلّم" subtitle="سجل النتائج يعرض أفضل درجة وعدد المحاولات لكل درس." />
    {q.data?.length ? <div className="card table-wrap" style={{ marginTop:24 }}><table><thead><tr><th>الدرس</th><th>المادة والوحدة</th><th>أفضل نتيجة</th><th>المحاولات</th><th>آخر محاولة</th><th>الحالة</th></tr></thead><tbody>{q.data.map(entry=><tr key={entry.lessonId} data-testid={`progress-row-${entry.lessonId}`}><td>{entry.lessonTitle}</td><td>{entry.subjectTitle} · {entry.unitTitle}</td><td className="mono">{entry.bestScore}%</td><td>{entry.attempts}</td><td>{new Date(entry.lastAttemptAt).toLocaleDateString('ar-JO')}</td><td>{entry.isCompleted?'مكتمل':'قيد التعلّم'}</td></tr>)}</tbody></table></div> : <EmptyState title="رحلتك تبدأ بأول درس" body="ابدأ درسًا من المنهاج، وسيظهر سجل محاولاتك هنا." />}
  </AppShell>;
}

function Leaderboard() {
  const q = useGetLeaderboard({ query: { queryKey: getGetLeaderboardQueryKey() } });
  if (q.isLoading) return <PageLoading />;
  if (q.isError) return <AppShell><ErrorState retry={()=>q.refetch()} /></AppShell>;
  return <AppShell><PageIntro eyebrow="مجتمع المتعلمين" title="لوحة المتصدرين" subtitle="ترتيب مبني على نقاط الخبرة المسجلة في المنصة." />
    {q.data?.length ? <div className="card table-wrap" style={{ marginTop:24 }}><table><thead><tr><th>الترتيب</th><th>الطالب</th><th>الصف</th><th>المستوى</th><th>نقاط الخبرة</th></tr></thead><tbody>{q.data.map(student=><tr key={`${student.rank}-${student.displayName}`} data-testid={`leaderboard-row-${student.rank}`}><td><span className="leader-rank">{student.rank<=3?<Crown size={15}/>:student.rank}</span></td><td>{student.displayName}</td><td>{student.gradeTitle ?? '—'}</td><td>{student.level}</td><td className="mono">{student.totalXp.toLocaleString('ar-JO')}</td></tr>)}</tbody></table></div> : <EmptyState title="لا توجد نتائج للعرض" body="ستظهر لوحة الترتيب عند توفر بيانات حقيقية من الطلاب." />}
  </AppShell>;
}

type AdminSection = 'grades' | 'subjects' | 'units' | 'lessons' | 'questions' | 'students';
type AdminItem = Grade | Subject | Unit | Lesson | AdminQuestion | AdminStudent;
const adminTabs: { id: AdminSection; label: string }[] = [
  { id:'grades', label:'الصفوف' }, { id:'subjects', label:'المواد' }, { id:'units', label:'الوحدات' },
  { id:'lessons', label:'الدروس' }, { id:'questions', label:'الأسئلة' }, { id:'students', label:'الطلاب' },
];

function Admin() {
  const profile = useGetMyProfile({ query: { queryKey: getGetMyProfileQueryKey() } });
  const overview = useGetAdminOverview({ query: { queryKey: getGetAdminOverviewQueryKey() } });
  const grades = useListAdminGrades({ query: { queryKey: getListAdminGradesQueryKey() } });
  const subjects = useListAdminSubjects(undefined, { query: { queryKey: getListAdminSubjectsQueryKey(undefined) } });
  const units = useListAdminUnits(undefined, { query: { queryKey: getListAdminUnitsQueryKey(undefined) } });
  const lessons = useListAdminLessons(undefined, { query: { queryKey: getListAdminLessonsQueryKey(undefined) } });
  const students = useListAdminStudents({ query: { queryKey: getListAdminStudentsQueryKey() } });
  const [section,setSection] = useState<AdminSection>('grades');
  const [questionLessonId,setQuestionLessonId] = useState<number>(0);
  const questionParams = { lessonId: questionLessonId || 1 };
  const questions = useListAdminQuestions(questionParams, { query: { queryKey: getListAdminQuestionsQueryKey(questionParams), enabled: !!questionLessonId } });
  const createGrade = useCreateGrade(); const updateGrade = useUpdateGrade(); const deleteGrade = useDeleteGrade();
  const createSubject = useCreateSubject(); const updateSubject = useUpdateSubject(); const deleteSubject = useDeleteSubject();
  const createUnit = useCreateUnit(); const updateUnit = useUpdateUnit(); const deleteUnit = useDeleteUnit();
  const createLesson = useCreateLesson(); const updateLesson = useUpdateLesson(); const deleteLesson = useDeleteLesson();
  const createQuestion = useCreateQuestion(); const updateQuestion = useUpdateQuestion(); const deleteQuestion = useDeleteQuestion();
  const updateStudent = useUpdateAdminStudent();
  const qc = useQueryClient();
  const [editor,setEditor] = useState<{kind:AdminSection; id?:number; value:string}|null>(null);
  const [operationError,setOperationError] = useState('');

  const refetchAll = () => {
    void qc.invalidateQueries({ queryKey: getGetAdminOverviewQueryKey() });
    void qc.invalidateQueries({ queryKey: getListAdminGradesQueryKey() });
    void qc.invalidateQueries({ queryKey: getListAdminSubjectsQueryKey(undefined) });
    void qc.invalidateQueries({ queryKey: getListAdminUnitsQueryKey(undefined) });
    void qc.invalidateQueries({ queryKey: getListAdminLessonsQueryKey(undefined) });
    void qc.invalidateQueries({ queryKey: getListAdminQuestionsQueryKey(questionParams) });
    void qc.invalidateQueries({ queryKey: getListAdminStudentsQueryKey() });
    void qc.invalidateQueries({ queryKey: getListGradesQueryKey() });
  };

  const arrays: Record<AdminSection, AdminItem[]> = {
    grades: grades.data ?? [], subjects: subjects.data ?? [], units: units.data ?? [],
    lessons: lessons.data ?? [], questions: questions.data ?? [], students: students.data ?? [],
  };
  const isLoading = overview.isLoading || grades.isLoading || subjects.isLoading || units.isLoading || lessons.isLoading || students.isLoading;
  const canAdmin = profile.data?.role === 'admin';
  if (profile.isLoading) return <PageLoading />;
  if (!canAdmin) return <AppShell><PageIntro eyebrow="إدارة المنصة" title="صلاحيات غير متاحة" subtitle="هذه المساحة مخصصة للمشرفين المخوّلين." /><div className="card empty" style={{marginTop:22}} data-testid="state-admin-unauthorized"><div className="empty-mark"><ShieldAlert/></div><h3>لا تملك صلاحية إدارة المحتوى</h3><p>إذا كنت تحتاج إلى إدارة المنصة، اطلب من المسؤول منح حسابك دور المشرف.</p><Link className="btn btn-quiet" href="/dashboard" data-testid="link-admin-back">العودة للرئيسية</Link></div></AppShell>;
  if (profile.isError) return <AppShell><ErrorState retry={()=>profile.refetch()} message="تعذّر التحقق من صلاحية الحساب." /></AppShell>;
  if (isLoading) return <PageLoading />;
  if (overview.isError || grades.isError || subjects.isError || units.isError || lessons.isError || students.isError) return <AppShell><ErrorState retry={()=>{overview.refetch();grades.refetch();subjects.refetch();units.refetch();lessons.refetch();students.refetch();}} /></AppShell>;

  const openCreate = () => {
    const initial: Record<AdminSection,object> = {
      grades:{gradeNumber:1,title:'',stage:'',contentStatus:'draft'},
      subjects:{gradeId:grades.data?.[0]?.id ?? 1,title:'',description:''},
      units:{subjectId:subjects.data?.[0]?.id ?? 1,title:'',position:0,contentStatus:'draft'},
      lessons:{unitId:units.data?.[0]?.id ?? 1,title:'',description:'',objective:'',explanation:'',objectives:[],durationMinutes:20,contentStatus:'draft',sourceReference:''},
      questions:{lessonId:questionLessonId || lessons.data?.[0]?.id || 1,prompt:'',kind:'multiple_choice',options:['',''],correctOption:0,explanation:'',position:0,contentStatus:'draft',sourceReference:''},
      students:{gradeId:null,role:'student',status:'active'},
    };
    setOperationError('');
    setEditor({kind:section,value:JSON.stringify(initial[section],null,2)});
  };
  const openEdit = (item:AdminItem) => {
    setOperationError('');
    setEditor({kind:section,id:item.id,value:JSON.stringify(item,null,2)});
  };
  const submitEditor = () => {
    if (!editor) return;
    let body: Record<string,unknown>;
    try { body = JSON.parse(editor.value) as Record<string,unknown>; } catch { setOperationError('البيانات ليست بصيغة JSON صحيحة.'); return; }
    setOperationError('');
    const success = () => { refetchAll(); setEditor(null); };
    const failed = () => setOperationError('لم يتم حفظ التغييرات. راجع الحقول وحاول مجددًا.');
    try {
      switch(editor.kind) {
        case 'grades':
          if (editor.id) updateGrade.mutate({gradeId:editor.id,data:body as unknown as Grade}, {onSuccess:success,onError:failed});
          else createGrade.mutate({data:body as unknown as GradeInput}, {onSuccess:success,onError:failed});
          break;
        case 'subjects':
          if (editor.id) updateSubject.mutate({subjectId:editor.id,data:body as unknown as Subject}, {onSuccess:success,onError:failed});
          else createSubject.mutate({data:body as unknown as SubjectInput}, {onSuccess:success,onError:failed});
          break;
        case 'units':
          if (editor.id) updateUnit.mutate({unitId:editor.id,data:body as unknown as Unit}, {onSuccess:success,onError:failed});
          else createUnit.mutate({data:body as unknown as UnitInput}, {onSuccess:success,onError:failed});
          break;
        case 'lessons':
          if (editor.id) updateLesson.mutate({lessonId:editor.id,data:body as unknown as Lesson}, {onSuccess:success,onError:failed});
          else createLesson.mutate({data:body as unknown as LessonInput}, {onSuccess:success,onError:failed});
          break;
        case 'questions':
          if (editor.id) updateQuestion.mutate({questionId:editor.id,data:body as unknown as AdminQuestion}, {onSuccess:success,onError:failed});
          else createQuestion.mutate({data:body as unknown as QuestionInput}, {onSuccess:success,onError:failed});
          break;
        case 'students':
           if (editor.id) updateStudent.mutate({studentId:editor.id,data:body as unknown as StudentUpdate}, {onSuccess:success,onError:failed});
          break;
      }
    } catch { failed(); }
  };
  const deleteItem = (item:AdminItem) => {
    if (!window.confirm('هل تريد حذف هذا السجل؟ لا يمكن التراجع عن الحذف.')) return;
    const done = {onSuccess:refetchAll,onError:()=>setOperationError('تعذر حذف السجل.')};
    switch(section) {
      case 'grades': deleteGrade.mutate({gradeId:item.id},done); break;
      case 'subjects': deleteSubject.mutate({subjectId:item.id},done); break;
      case 'units': deleteUnit.mutate({unitId:item.id},done); break;
      case 'lessons': deleteLesson.mutate({lessonId:item.id},done); break;
      case 'questions': deleteQuestion.mutate({questionId:item.id},done); break;
      case 'students': setOperationError('إزالة حساب الطالب غير متاحة؛ يمكن تغيير حالته بدلًا من ذلك.'); break;
    }
  };
  const itemTitle = (item:AdminItem): string => {
    const record = item as unknown as Record<string, unknown>;
    if (typeof record.title === 'string') return record.title;
    if (typeof record.displayName === 'string') return record.displayName;
    if (typeof record.prompt === 'string') return record.prompt;
    return `سجل ${String(record.id ?? '')}`;
  };
  const itemStatus = (item:AdminItem): string | null => {
    const value = (item as unknown as Record<string, unknown>).contentStatus;
    return typeof value === 'string' ? value : null;
  };
  const itemDetail = (item:AdminItem): string => {
    const record = item as unknown as Record<string, unknown>;
    if ('sourceReference' in record) return typeof record.sourceReference === 'string' && record.sourceReference ? record.sourceReference : 'لا يوجد مرجع مصدر';
    if ('gradeTitle' in record) return `${record.gradeTitle ?? 'صف غير محدد'} · ${String(record.status ?? '')}`;
    if ('stage' in record) return `${String(record.stage)} · ${String(record.subjectCount)} مواد`;
    if ('unitCount' in record) return `${String(record.unitCount)} وحدات`;
    if ('lessonCount' in record) return `${String(record.lessonCount)} دروس`;
    if ('questionCount' in record) return `${String(record.questionCount)} أسئلة`;
    return '';
  };

  return <AppShell><PageIntro eyebrow="مساحة المشرف" title="إدارة المحتوى والطلاب" subtitle="راجع حالة المصدر قبل النشر، واحتفظ بالمراجع مع كل تعديل." />
    <div className="toolbar" style={{ marginTop: 18 }}><Link href="/admin/curriculum" className="btn btn-primary" data-testid="link-open-curriculum-admin">لوحة المنهاج والاستيراد المجمّع</Link></div>
    <div className="grid grid-stats" style={{ marginTop:22 }}><Stat label="الطلاب" value={overview.data?.studentCount ?? 0} icon={<UsersRound/>}/><Stat label="الدروس" value={overview.data?.lessonCount ?? 0} icon={<BookOpen/>}/><Stat label="الأسئلة" value={overview.data?.questionCount ?? 0} icon={<CircleHelp/>}/><Stat label="دروس مسودة" value={overview.data?.draftLessonCount ?? 0} icon={<ClipboardList/>}/></div>
    <div className="banner" style={{marginTop:18}}><ShieldAlert size={18}/><span>المسودة والمراجعة لا تعنيان اعتماد المحتوى. احفظ مرجع المصدر وحالة التحقق كما هي.</span></div>
    <div className="toolbar" role="tablist" aria-label="أقسام الإدارة" style={{marginTop:25}}>{adminTabs.map(tab=><button type="button" role="tab" aria-selected={section===tab.id} className={`btn ${section===tab.id?'btn-primary':'btn-quiet'}`} key={tab.id} onClick={()=>setSection(tab.id)} data-testid={`tab-admin-${tab.id}`}>{tab.label}</button>)}</div>
    {section==='questions' && <label className="field" style={{maxWidth:380}}><span>الأسئلة التابعة لدرس</span><select value={questionLessonId || ''} onChange={e=>setQuestionLessonId(Number(e.target.value))} data-testid="select-question-lesson"><option value="">اختر درسًا</option>{lessons.data?.map(lesson=><option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select></label>}
    <div className="section-heading"><h2>{adminTabs.find(t=>t.id===section)?.label}</h2>{section!=='students' && <button className="btn btn-primary" type="button" onClick={openCreate} data-testid="button-create-record"><Plus size={16}/> إضافة سجل</button>}</div>
    {operationError && <div className="banner" role="alert" data-testid="text-admin-error">{operationError}</div>}
    {section==='questions' && !questionLessonId ? <EmptyState title="اختر درسًا لعرض أسئلته" body="تظهر الأسئلة المرتبطة بالدرس المختار فقط." /> :
      arrays[section].length ? <div className="card table-wrap"><table><thead><tr><th>السجل</th><th>التفاصيل / المصدر</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>{arrays[section].map(item=><tr key={item.id} data-testid={`admin-row-${section}-${item.id}`}><td>{itemTitle(item)}</td><td>{itemDetail(item)}</td><td>{itemStatus(item)?<Status value={itemStatus(item)!}/>:String((item as unknown as Record<string,unknown>).status ?? '—')}</td><td><div style={{display:'flex',gap:4}}><button className="icon-btn" type="button" aria-label={`تعديل ${itemTitle(item)}`} onClick={()=>openEdit(item)} data-testid={`button-edit-${section}-${item.id}`}><Pencil size={16}/></button>{section!=='students'&&<button className="icon-btn" type="button" aria-label={`حذف ${itemTitle(item)}`} onClick={()=>deleteItem(item)} data-testid={`button-delete-${section}-${item.id}`}><Trash2 size={16}/></button>}</div></td></tr>)}</tbody></table></div> :
        <EmptyState title="لا توجد سجلات في هذا القسم" body={section==='questions'?'لا توجد أسئلة مرتبطة بهذا الدرس بعد.':'أضف سجلًا جديدًا للبدء، أو تحقق من اتصال الإدارة.'} />}
    {editor && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="admin-editor-title" dir="rtl"><div className="modal-head"><div><span className="eyebrow">{editor.id?'تعديل':'إضافة'} · {adminTabs.find(t=>t.id===editor.kind)?.label}</span><h2 id="admin-editor-title" style={{margin:'6px 0'}}>بيانات السجل</h2></div><button type="button" className="icon-btn" onClick={()=>setEditor(null)} aria-label="إغلاق" data-testid="button-close-editor"><X size={20}/></button></div><p className="row-meta">تحرير الحقول بصيغة JSON يحافظ على المعرّفات ومراجع المصدر ووسوم حالة المحتوى. لا تغيّر الإجابة الصحيحة إلا عند التحقق منها.</p><label className="field"><span>حقول المحتوى</span><textarea value={editor.value} onChange={e=>setEditor({...editor,value:e.target.value})} rows={17} dir="ltr" style={{fontFamily:'var(--app-font-mono)',fontSize:12}} data-testid="textarea-admin-json"/></label>{operationError&&<p role="alert" style={{color:'hsl(var(--destructive))'}}>{operationError}</p>}<div style={{display:'flex',gap:10}}><button className="btn btn-primary" type="button" onClick={submitEditor} data-testid="button-save-record">حفظ السجل</button><button className="btn btn-quiet" type="button" onClick={()=>setEditor(null)} data-testid="button-cancel-record">إلغاء</button></div></section></div>}
  </AppShell>;
}

function RootRoutes() {
  return <>
    <ClerkCacheInvalidator />
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in/*?" component={AuthPages} />
      <Route path="/sign-up/*?" component={AuthPages} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/curriculum/books" component={BooksInventory} />
      <Route path="/curriculum" component={Curriculum} />
      <Route path="/curriculum/grade/:gradeId" component={GradeSubjects} />
      <Route path="/curriculum/subject/:subjectId" component={SubjectUnits} />
      <Route path="/curriculum/unit/:unitId" component={UnitLessons} />
      <Route path="/lessons/:lessonId/quiz" component={QuizPage} />
      <Route path="/lessons/:lessonId" component={LessonPage} />
      <Route path="/progress" component={Progress} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/curriculum" component={CurriculumAdmin} />
      <Route><AppShell><EmptyState title="الصفحة غير موجودة" body="قد يكون الرابط غير صحيح أو أن الصفحة نُقلت." /><Link href="/dashboard" className="btn btn-primary" data-testid="link-not-found-home">الرئيسية</Link></AppShell></Route>
    </Switch>
  </>;
}

function App() {
  // بيانات محلية احتياطية: تُشغّل صفحات المنهاج والاختبارات عند غياب خدمة الـ API.
  installLocalBackend();
  // قسم الرياضيات له واجهة مستقلة على المسار /math.
  const initialPath = stripBase(window.location.pathname);
  if (initialPath === '/math' || initialPath.startsWith('/math/')) {
    return <WouterRouter base={basePath}><StudyApp /></WouterRouter>;
  }
  return <WouterRouter base={basePath}><ClerkProviderWithRoutes /></WouterRouter>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  const app = <QueryClientProvider client={queryClient}><RootRoutes /></QueryClientProvider>;
  // بلا مفتاح Clerk حقيقي لا نُحمّل سكربته إطلاقًا: تعمل المنصة بجلسة الطالب المحلية.
  if (!CLERK_ENABLED || !clerkPubKey) return app;
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={appearance}
      signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} localization={arSA}
      routerPush={to=>setLocation(stripBase(to))} routerReplace={to=>setLocation(stripBase(to), {replace:true})}>
      <ClerkBridge>{app}</ClerkBridge>
    </ClerkProvider>;
}

export default App;

