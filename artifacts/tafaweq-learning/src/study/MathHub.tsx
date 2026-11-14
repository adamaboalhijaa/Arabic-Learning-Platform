import { Link } from 'wouter';
import { ArrowLeft, BookOpen, BookOpenCheck, CheckCircle2, Clock3, Target, Zap } from 'lucide-react';
import { MathText } from '../MathText';
import { levelInfo, lessonScore, useMathProgress } from '../lib/math-progress';
import { useMathBundle } from './math-context';
import { StudyShell } from './StudyShell';

export function MathHub() {
  const {
    base,
    grade,
    gradeOptions,
    MATH10_LESSONS,
    MATH10_META,
    MATH10_SEMESTERS,
    MATH10_UNITS,
    lessonLevelCounts,
    lessonQuestionCount,
    math10LevelTotals,
  } = useMathBundle();
  const progress = useMathProgress();
  const level = levelInfo(progress.xp);
  const totalQuestions = lessonQuestionCount();
  const mastered = Object.values(progress.lessons).filter((lesson) => lesson.mastered).length;
  const answered = Object.values(progress.answers).filter((answer) => answer.correct).length;
  const levelTotals = math10LevelTotals();

  return (
    <StudyShell>
      <section className="study-hero">
        <p className="study-eyebrow">{MATH10_META.country} · {MATH10_META.semester}</p>
        <h1 className="study-title">الرياضيات — {MATH10_META.grade}</h1>
        <p className="study-sub">
          {MATH10_UNITS.length} وحدات و{MATH10_LESSONS.length} درسًا موزّعة على الفصلين الدراسيين، وكل درس مرتبط بأسئلته
          الخاصة: اختيار من متعدد وصح وخطأ، سؤال واحد في كل شاشة، مع تصحيح فوري وشرح مبسّط ومرجع صفحة الكتاب.
        </p>
        <p className="study-meta" style={{ marginTop: 8 }} data-testid="math-level-totals">
          بنك الأسئلة بثلاث درجات صعوبة: {levelTotals.easy} سهلًا · {levelTotals.medium} متوسطًا · {levelTotals.hard} متقدمًا.
        </p>

        <div className="study-stats">
          <div className="study-stat"><BookOpenCheck size={18} /><div><strong>{MATH10_UNITS.length}</strong><span>وحدات</span></div></div>
          <div className="study-stat"><BookOpen size={18} /><div><strong>{MATH10_LESSONS.length}</strong><span>درسًا</span></div></div>
          <div className="study-stat"><Target size={18} /><div><strong>{totalQuestions}</strong><span>سؤالًا مرتبطًا</span></div></div>
          <div className="study-stat"><CheckCircle2 size={18} /><div><strong>{answered}</strong><span>إجابة صحيحة</span></div></div>
        </div>

        <div className="study-level">
          <div className="study-level-head">
            <span><Zap size={15} style={{ verticalAlign: '-2px', marginInlineEnd: 6 }} />المستوى {level.level} · {level.title}</span>
            <span className="study-meta">{progress.xp} XP{level.nextMinXp ? ` · ${level.remaining} XP للمستوى التالي` : ' · أعلى مستوى'}</span>
          </div>
          <div className="study-bar"><span style={{ width: `${level.progress}%` }} /></div>
          <p className="study-meta" style={{ marginTop: 8 }}>
            تُمنح نقاط الخبرة عند أول إجابة صحيحة (10 XP)، وعند إتقان الدرس (15 XP)، وعند الإجابة الكاملة (25 XP).
            أتقنت حتى الآن {mastered} من {MATH10_LESSONS.length} درسًا.
          </p>
        </div>
      </section>

      <nav className="study-actions" style={{ marginTop: 18 }} aria-label="اختيار الصف" data-testid="math-grade-switcher">
        <span className="study-meta" style={{ marginInlineEnd: 4 }}>الصف:</span>
        {gradeOptions.map((option) => (
          <Link
            key={option.grade}
            href={option.hubPath}
            className={`btn ${option.grade === grade ? 'btn-primary' : 'btn-quiet'}`}
            data-testid={`link-grade-${option.grade}`}
          >
            {option.label}
          </Link>
        ))}
      </nav>

      {MATH10_SEMESTERS.map((semester) => (
        <section key={semester.number} style={{ marginTop: 26 }} data-testid={`semester-${semester.number}`}>
          <div className="study-unit-head" style={{ marginBottom: 12 }}>
            <h2 className="study-card-title" style={{ margin: 0 }}>{semester.title}</h2>
            <span className="study-meta">
              {semester.units.length} وحدات ·{' '}
              {semester.units.reduce(
                (sum, unit) => sum + unit.lessons.reduce((s, lesson) => s + lesson.questions.length, 0),
                0,
              )}{' '}
              سؤالًا
            </span>
          </div>
          <div className="study-grid">
        {semester.units.map((unit) => {
          const unitIndex = MATH10_UNITS.findIndex((item) => item.id === unit.id);
          const unitMastered = unit.lessons.filter((lesson) => progress.lessons[lesson.id]?.mastered).length;
          return (
            <article className="study-card" key={unit.id}>
              <div className="study-unit-head">
                <span className="study-badge">الوحدة {unitIndex + 1}</span>
                <span className="study-meta">{unit.lessons.length} دروس · {unit.lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0)} سؤالًا</span>
              </div>
              <h2 className="study-card-title">{unit.title}</h2>
              <p className="study-sub" style={{ fontSize: 13.5, margin: '6px 0 0' }}>{unit.description}</p>

              <div className="study-list">
                {unit.lessons.map((lesson, lessonIndex) => {
                  const score = lessonScore(progress, lesson.id, lesson.questions.length);
                  const record = progress.lessons[lesson.id];
                  const levels = lessonLevelCounts(lesson);
                  return (
                    <Link
                      key={lesson.id}
                      href={`${base}/lesson/${lesson.id}`}
                      className="study-lesson-row"
                      data-testid={`link-lesson-${lesson.id}`}
                    >
                      <span className="study-lesson-num">{lessonIndex + 1}</span>
                      <span style={{ minWidth: 0 }}>
                        <strong>{lesson.title}</strong>
                        <small>
                          <Clock3 size={12} style={{ verticalAlign: '-1px', marginInlineEnd: 4 }} />
                          {lesson.durationMinutes} دقيقة · {lesson.page ? `ص ${lesson.page} · ` : ''}{lesson.questions.length} أسئلة
                          {' '}· سهل {levels.easy} · متوسط {levels.medium} · متقدم {levels.hard}
                        </small>
                      </span>
                      <span className="study-row-end">
                        {record ? (
                          <span className={`study-badge ${record.mastered ? 'good' : 'warn'}`}>
                            {record.mastered ? 'مُتقن' : 'قيد التدريب'} {score}%
                          </span>
                        ) : (
                          <span className="study-badge">لم يبدأ</span>
                        )}
                        <ArrowLeft size={16} />
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="study-actions">
                <Link href={`${base}/unit/${unit.id}`} className="btn btn-quiet" data-testid={`link-unit-${unit.id}`}>
                  نظرة على الوحدة ({unitMastered}/{unit.lessons.length} مُتقن)
                </Link>
              </div>
            </article>
          );
        })}
          </div>
        </section>
      ))}

      <section className="study-card" style={{ marginTop: 20 }}>
        <h2 className="study-card-title">كيف يعمل قسم الرياضيات؟</h2>
        <ol className="study-steps">
          <li><strong>اختر الدرس</strong> واقرأ الشرح والأمثلة المحلولة مع الصيغ الرياضية.</li>
          <li><strong>ابدأ الأسئلة</strong> الخاصة بالدرس نفسه — سؤال واحد في كل شاشة.</li>
          <li><strong>اختر الإجابة</strong> فيظهر التصحيح فورًا مع شرح مبسّط ومرجع الصفحة.</li>
          <li><strong>اجمع XP</strong> وارتقِ في المستويات، ويُحفظ تقدمك تلقائيًا على جهازك.</li>
        </ol>
        <p className="study-meta" style={{ marginTop: 10 }}>
          محتوى الكتاب: <MathText text={MATH10_META.book} />
        </p>
      </section>
    </StudyShell>
  );
}
