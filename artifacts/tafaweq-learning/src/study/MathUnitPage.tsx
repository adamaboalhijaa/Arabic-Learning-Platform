import { Link, useRoute } from 'wouter';
import { ArrowLeft, ArrowRight, BookOpen, Clock3 } from 'lucide-react';
import { findUnit, MATH10_UNITS } from '../data/math10';
import { lessonScore, useMathProgress } from '../lib/math-progress';
import { StudyShell } from './StudyShell';

export function MathUnitPage() {
  const [, params] = useRoute('/math/unit/:unitId');
  const unit = findUnit(params?.unitId ?? '');
  const progress = useMathProgress();

  if (!unit) {
    return (
      <StudyShell>
        <div className="study-card">
          <h1 className="study-title" style={{ fontSize: 22 }}>الوحدة غير موجودة</h1>
          <p className="study-sub">قد يكون الرابط غير صحيح. <Link href="/math" className="study-link">عُد إلى قائمة الوحدات</Link>.</p>
        </div>
      </StudyShell>
    );
  }

  const index = MATH10_UNITS.findIndex((item) => item.id === unit.id);
  const previous = MATH10_UNITS[index - 1];
  const next = MATH10_UNITS[index + 1];
  const questions = unit.lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0);

  return (
    <StudyShell>
      <nav className="study-crumbs">
        <Link href="/math">الرياضيات — الصف العاشر</Link>
        <span>/</span>
        <span>الوحدة {index + 1}</span>
      </nav>

      <section className="study-hero">
        <p className="study-eyebrow">الوحدة {index + 1} · {index < 4 ? 'الفصل الأول' : 'الفصل الثاني'}</p>
        <h1 className="study-title">{unit.title}</h1>
        <p className="study-sub">{unit.description}</p>
        <div className="study-stats">
          <div className="study-stat"><BookOpen size={18} /><div><strong>{unit.lessons.length}</strong><span>دروس</span></div></div>
          <div className="study-stat"><Clock3 size={18} /><div><strong>{questions}</strong><span>سؤالًا</span></div></div>
        </div>
      </section>

      <div className="study-list" style={{ marginTop: 18 }}>
        {unit.lessons.map((lesson, lessonIndex) => {
          const score = lessonScore(progress, lesson.id, lesson.questions.length);
          const record = progress.lessons[lesson.id];
          return (
            <article className="study-card" key={lesson.id}>
              <div className="study-unit-head">
                <span className="study-badge">الدرس {lessonIndex + 1}</span>
                <span className="study-meta">{lesson.page ? `ص ${lesson.page} · ` : ''}{lesson.durationMinutes} دقيقة · {lesson.questions.length} أسئلة</span>
              </div>
              <h2 className="study-card-title">{lesson.title}</h2>
              <p className="study-sub" style={{ fontSize: 14, margin: '4px 0 0' }}>{lesson.objective}</p>
              <div className="study-actions">
                <Link href={`/math/lesson/${lesson.id}`} className="btn btn-primary" data-testid={`link-study-${lesson.id}`}>
                  ابدأ الدرس <ArrowLeft size={16} />
                </Link>
                <Link href={`/math/lesson/${lesson.id}/quiz`} className="btn btn-quiet" data-testid={`link-quiz-${lesson.id}`}>
                  الأسئلة مباشرة
                </Link>
                {record ? (
                  <span className={`study-badge ${record.mastered ? 'good' : 'warn'}`}>
                    أفضل نتيجة {score}% · {record.attempts} محاولة
                  </span>
                ) : (
                  <span className="study-badge">لم يبدأ بعد</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="study-actions">
        {previous && <Link href={`/math/unit/${previous.id}`} className="btn btn-quiet"><ArrowRight size={16} /> الوحدة السابقة</Link>}
        {next && <Link href={`/math/unit/${next.id}`} className="btn btn-quiet">الوحدة التالية <ArrowLeft size={16} /></Link>}
      </div>
    </StudyShell>
  );
}
