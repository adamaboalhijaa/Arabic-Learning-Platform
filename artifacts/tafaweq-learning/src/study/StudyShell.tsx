import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { BookOpen, GraduationCap, Sparkles, Trophy, Zap } from 'lucide-react';
import { levelInfo, useMathProgress } from '../lib/math-progress';
import { useMathBundle } from './math-context';

/** واجهة عامة لقسم الرياضيات بنفس هوية الموقع، تعمل دون تسجيل دخول. */
export function StudyShell({ children }: { children: ReactNode }) {
  const { base, meta } = useMathBundle();
  const [location] = useLocation();
  const progress = useMathProgress();
  const level = levelInfo(progress.xp);

  const isActive = (href: string) =>
    href === base ? location === base || location === '/' : location.startsWith(href);

  return (
    <div className="study-app" dir="rtl">
      <header className="study-header">
        <div className="study-header-inner">
          <Link href={base} className="study-brand" data-testid="link-study-brand">
            <span className="study-brand-mark"><GraduationCap size={20} /></span>
            <span>
              التفوّق
              <small>رياضيات {meta.grade}</small>
            </span>
          </Link>

          <nav className="study-nav" aria-label="تنقل قسم الرياضيات">
            <Link href={base} className={isActive(base) ? 'active' : ''} data-testid="link-nav-math">
              <BookOpen size={15} style={{ marginInlineEnd: 6, verticalAlign: '-2px' }} />
              الوحدات والدروس
            </Link>
            <Link href={`${base}/progress`} className={isActive(`${base}/progress`) ? 'active' : ''} data-testid="link-nav-progress">
              <Trophy size={15} style={{ marginInlineEnd: 6, verticalAlign: '-2px' }} />
              تقدّمي ونتائجي
            </Link>
          </nav>

          <div className="study-xp" data-testid="badge-xp-level" title={`مستواك: ${level.title}`}>
            <Zap size={15} />
            <span>{progress.xp} XP</span>
            <span className="study-xp-sep" />
            <span>المستوى {level.level} · {level.title}</span>
          </div>
        </div>
      </header>

      <main className="study-main">{children}</main>

      <footer className="study-footer">
        <span>أكاديمية التفوّق · الرياضيات — {meta.grade} — المنهاج الأردني</span>
        <span><Sparkles size={13} style={{ verticalAlign: '-2px', marginInlineEnd: 5 }} />أسئلة مرتبطة بكل درس، وتصحيح فوري مع شرح.</span>
      </footer>
    </div>
  );
}
