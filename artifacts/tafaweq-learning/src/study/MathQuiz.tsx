import { useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy, XCircle, Zap } from 'lucide-react';
import { MathText } from '../MathText';
import { findLesson, findUnitOfLesson, lessonPosition, nextLesson } from '../data/math10';
import { completeLesson, levelInfo, recordAnswer, useMathProgress } from '../lib/math-progress';
import { StudyShell } from './StudyShell';

export function MathQuiz() {
  const [, params] = useRoute('/math/lesson/:lessonId/quiz');
  const lesson = findLesson(params?.lessonId ?? '');
  const unit = lesson ? findUnitOfLesson(lesson.id) : undefined;
  const progress = useMathProgress();
  const [, navigate] = useLocation();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [gained, setGained] = useState(0);
  const [finished, setFinished] = useState(false);
  const [bonus, setBonus] = useState(0);

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

  const question = lesson.questions[index];
  const total = lesson.questions.length;
  const position = lessonPosition(lesson.id);
  const level = levelInfo(progress.xp);
  const following = nextLesson(lesson.id);

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setGained(0);
    setBonus(0);
    setFinished(false);
  };

  const choose = (optionIndex: number) => {
    if (answered) return;
    const isCorrect = optionIndex === question.correctOption;
    setSelected(optionIndex);
    setAnswered(true);
    if (isCorrect) setCorrectCount((count) => count + 1);
    setGained((value) => value + recordAnswer(question.id, isCorrect));
  };

  const goNext = () => {
    if (!answered) return;
    if (index + 1 >= total) {
      setBonus(completeLesson(lesson.id, correctCount, total));
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setAnswered(false);
  };

  if (finished) {
    const ratio = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const mastered = ratio >= 60;
    return (
      <StudyShell>
        <section className="study-question-card study-result" data-testid="quiz-result">
          <div className={`study-result-icon ${mastered ? 'ok' : 'no'}`}>
            {mastered ? <Trophy size={30} /> : <RotateCcw size={30} />}
          </div>
          <h1 className="study-title" style={{ fontSize: 24 }}>{mastered ? 'أتقنت الدرس!' : 'تحتاج مراجعة بسيطة'}</h1>
          <p className="study-sub" style={{ margin: '0 auto' }}>
            نتيجتك في «{lesson.title}»: {correctCount} من {total} ({ratio}%)
          </p>
          <p className="study-result-big" data-testid="quiz-score">{ratio}%</p>
          <div className="study-stats" style={{ justifyContent: 'center' }}>
            <div className="study-stat"><Zap size={18} /><div><strong>+{gained + bonus}</strong><span>XP في هذه الجلسة</span></div></div>
            <div className="study-stat"><Trophy size={18} /><div><strong>{progress.xp}</strong><span>إجمالي XP</span></div></div>
            <div className="study-stat"><CheckCircle2 size={18} /><div><strong>{level.level}</strong><span>{level.title}</span></div></div>
          </div>
          {bonus > 0 && <p className="study-meta" style={{ marginTop: 10 }}>حصلت على مكافأة إتقان: +{bonus} XP.</p>}

          <div className="study-actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={restart} data-testid="btn-quiz-retry">
              <RotateCcw size={16} /> إعادة المحاولة
            </button>
            <Link href={`/math/lesson/${lesson.id}`} className="btn btn-quiet" data-testid="btn-back-lesson">
              العودة للدرس
            </Link>
            {following && (
              <button type="button" className="btn btn-quiet" onClick={() => navigate(`/math/lesson/${following.id}/quiz`)}>
                الدرس التالي <ArrowLeft size={16} />
              </button>
            )}
          </div>
        </section>
      </StudyShell>
    );
  }

  return (
    <StudyShell>
      <nav className="study-crumbs">
        <Link href="/math">الرياضيات — الصف العاشر</Link>
        <span>/</span>
        <Link href={`/math/unit/${unit.id}`}>{unit.title}</Link>
        <span>/</span>
        <Link href={`/math/lesson/${lesson.id}`}>{lesson.title}</Link>
        <span>/</span>
        <span>الأسئلة</span>
      </nav>

      <section className="study-question-card">
        <div className="study-quiz-top">
          <span className="study-badge">سؤال {index + 1} من {total} · الدرس {position.index} من {position.total}</span>
          <span className="study-badge">{question.kind === 'truefalse' ? 'صح / خطأ' : 'اختيار من متعدد'} · ص {question.page}</span>
        </div>
        <div className="study-bar" style={{ marginBottom: 18 }}>
          <span style={{ width: `${Math.round(((index + (answered ? 1 : 0)) / total) * 100)}%` }} />
        </div>

        <h1 className="study-question-text" data-testid="quiz-prompt"><MathText text={question.prompt} /></h1>

        <div className="study-options" role="group" aria-label="خيارات الإجابة">
          {question.options.map((option, optionIndex) => {
            const isCorrectOption = optionIndex === question.correctOption;
            const isPicked = selected === optionIndex;
            const state = !answered
              ? ''
              : isCorrectOption
                ? 'correct'
                : isPicked
                  ? 'wrong'
                  : 'muted';
            return (
              <button
                key={option}
                type="button"
                className={`study-option ${state}`}
                onClick={() => choose(optionIndex)}
                disabled={answered}
                data-testid={`quiz-option-${optionIndex}`}
              >
                <span className="key">{['أ', 'ب', 'ج', 'د'][optionIndex] ?? optionIndex + 1}</span>
                <span><MathText text={option} /></span>
                {answered && isCorrectOption && <CheckCircle2 size={18} className="study-option-mark ok" />}
                {answered && isPicked && !isCorrectOption && <XCircle size={18} className="study-option-mark no" />}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`study-feedback ${selected === question.correctOption ? 'ok' : 'no'}`} data-testid="quiz-feedback">
            <strong>
              {selected === question.correctOption
                ? 'إجابة صحيحة — أحسنت!'
                : `إجابة غير صحيحة — الإجابة الصحيحة: ${question.options[question.correctOption]}`}
            </strong>
            <span><MathText text={question.explanation} /></span>
            <small className="study-feedback-ref">المرجع: كتاب الطالب، صفحة {question.page}</small>
          </div>
        )}

        <div className="study-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={goNext}
            disabled={!answered}
            data-testid="btn-quiz-next"
          >
            {index + 1 >= total ? 'إظهار النتيجة' : 'السؤال التالي'} <ArrowLeft size={16} />
          </button>
          <Link href={`/math/lesson/${lesson.id}`} className="btn btn-quiet">مراجعة الشرح</Link>
          <span className="study-meta" style={{ marginInlineStart: 'auto' }}>
            صحيح: {correctCount} · XP: +{gained}
          </span>
        </div>
      </section>
    </StudyShell>
  );
}
