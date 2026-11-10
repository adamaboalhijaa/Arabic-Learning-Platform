import { Link, useRoute } from 'wouter';
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, ListChecks, Target } from 'lucide-react';
import { MathText } from '../MathText';
import { QUESTION_LEVEL_LABELS, findLesson, findUnitOfLesson, lessonPosition, questionLevel } from '../data/math10';
import { lessonScore, useMathProgress } from '../lib/math-progress';
import { StudyShell } from './StudyShell';

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="study-prose">
      {text.split('\n\n').map((paragraph, index) => (
        <p key={index}><MathText text={paragraph} /></p>
      ))}
    </div>
  );
}

export function MathLessonPage() {
  const [, params] = useRoute('/math/lesson/:lessonId');
  const lesson = findLesson(params?.lessonId ?? '');
  const unit = lesson ? findUnitOfLesson(lesson.id) : undefined;
  const progress = useMathProgress();

  if (!lesson || !unit) {
    return (
      <StudyShell>
        <div className="study-card">
          <h1 className="study-title" style={{ fontSize: 22 }}>الدرس غير موجود</h1>
          <p className="study-sub">قد يكون الرابط غير صحيح. <Link href="/math" className="study-link">عُد إلى قائمة الوحدات</Link>.</p>
        </div>
      </StudyShell>
    );
  }

  const position = lessonPosition(lesson.id);
  const record = progress.lessons[lesson.id];
  const score = lessonScore(progress, lesson.id, lesson.questions.length);

  return (
    <StudyShell>
      <nav className="study-crumbs">
        <Link href="/math">الرياضيات — الصف العاشر</Link>
        <span>/</span>
        <Link href={`/math/unit/${unit.id}`}>{unit.title}</Link>
        <span>/</span>
        <span>{lesson.title}</span>
      </nav>

      <section className="study-hero">
        <p className="study-eyebrow">الوحدة: {unit.title} · الدرس {position.index} من {position.total}</p>
        <h1 className="study-title">{lesson.title}</h1>
        <p className="study-sub">{lesson.objective}</p>
        <div className="study-stats">
          <div className="study-stat"><BookOpen size={18} /><div><strong>{lesson.page ? `ص ${lesson.page}` : 'المنهاج الأردني'}</strong><span>كتاب الطالب</span></div></div>
          <div className="study-stat"><Clock3 size={18} /><div><strong>{lesson.durationMinutes}</strong><span>دقيقة</span></div></div>
          <div className="study-stat"><ListChecks size={18} /><div><strong>{lesson.questions.length}</strong><span>أسئلة الدرس</span></div></div>
          <div className="study-stat"><CheckCircle2 size={18} /><div><strong>{score}%</strong><span>أفضل نتيجة</span></div></div>
        </div>
        <div className="study-actions">
          <Link href={`/math/lesson/${lesson.id}/quiz`} className="btn btn-primary" data-testid="link-start-quiz">
            ابدأ أسئلة الدرس ({lesson.questions.length} أسئلة) <ArrowLeft size={16} />
          </Link>
          {record && <span className={`study-badge ${record.mastered ? 'good' : 'warn'}`}>محاولاتك: {record.attempts} · {record.mastered ? 'أتقنت الدرس' : 'تحتاج مراجعة'}</span>}
        </div>
      </section>

      <div className="study-two-col">
        <section className="study-card">
          <h2 className="study-card-title">شرح الدرس</h2>
          <Paragraphs text={lesson.explanation} />

          {lesson.formulas.length > 0 && (
            <>
              <h3 className="study-card-subtitle">القوانين الأساسية</h3>
              <div className="study-formulas">
                {lesson.formulas.map((formula) => (
                  <div className="study-formula" key={formula.label}>
                    <span>{formula.label}</span>
                    <bdi dir="ltr">{formula.value}</bdi>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="study-side">
          <section className="study-card">
            <h2 className="study-card-title"><Target size={17} style={{ verticalAlign: '-3px', marginInlineEnd: 6 }} />أهداف الدرس</h2>
            <ul className="study-objectives">
              {lesson.objectives.map((objective) => (
                <li key={objective}><MathText text={objective} /></li>
              ))}
            </ul>
          </section>

          <section className="study-card">
            <h2 className="study-card-title">أمثلة محلولة</h2>
            {lesson.examples.map((example, index) => (
              <div className="study-example" key={example.prompt}>
                <strong>مثال {index + 1}: <MathText text={example.prompt} /></strong>
                <p style={{ margin: '8px 0 0' }}><MathText text={example.solution} /></p>
              </div>
            ))}
          </section>

          <section className="study-card">
            <h2 className="study-card-title">أسئلة هذا الدرس</h2>
            <p className="study-meta">أسئلة مرتبطة حصريًا بمحتوى الدرس، وتُصحَّح فور اختيار الإجابة.</p>
            <ol className="study-question-list">
              {lesson.questions.map((question, index) => (
                <li key={question.id}>
                  <span>{index + 1}. <MathText text={question.prompt} /></span>
                  <small>
                    {question.kind === 'truefalse' ? 'صح/خطأ' : 'اختيار من متعدد'} · {QUESTION_LEVEL_LABELS[questionLevel(question)]} · {question.page}
                  </small>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </StudyShell>
  );
}
