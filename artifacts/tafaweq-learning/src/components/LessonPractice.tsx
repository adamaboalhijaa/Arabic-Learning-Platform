/**
 * الأسئلة التفاعلية داخل صفحة الدرس:
 * سؤال واحد في كل شاشة، تصحيح فوري مع شرح مبسّط،
 * وXP مرة واحدة لكل سؤال عبر نقطة /api/questions/:id/answer.
 */
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Trophy, X, Zap } from 'lucide-react';
import {
  useSubmitQuizAttempt,
  getGetLessonQueryKey,
  getGetMyDashboardQueryKey,
  getGetMyProgressQueryKey,
  type QuizQuestion,
} from '@workspace/api-client-react';
import { MathText } from '../MathText';

interface Feedback {
  isCorrect: boolean;
  correctOption: number;
  explanation: string;
  earnedXp: number;
}

interface SavedResult {
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  earnedXp: number;
}

const apiBase = import.meta.env.BASE_URL.replace(/\/$/, '');

export function LessonPractice({ lessonId, questions }: { lessonId: number; questions: QuizQuestion[] }) {
  const qc = useQueryClient();
  const submit = useSubmitQuizAttempt();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedResult | null>(null);

  if (!questions.length) return null;

  const current = questions[Math.min(index, questions.length - 1)];
  const currentFeedback = feedback[current.id];
  const answeredCount = Object.keys(feedback).length;
  const allAnswered = answeredCount === questions.length;

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: getGetMyDashboardQueryKey() });
    void qc.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
    void qc.invalidateQueries({ queryKey: getGetLessonQueryKey(lessonId) });
  };

  const answer = async (optionIndex: number) => {
    if (currentFeedback || pendingId === current.id) return;
    setError(null);
    setPendingId(current.id);
    try {
      const response = await fetch(`${apiBase}/api/questions/${current.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedOption: optionIndex }),
      });
      if (!response.ok) throw new Error('answer-failed');
      const payload = (await response.json()) as Feedback;
      setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));
      setFeedback((prev) => ({ ...prev, [current.id]: payload }));
      invalidate();
    } catch {
      setError('لم يتم تسجيل الإجابة. تحقق من اتصالك وأعد المحاولة.');
    } finally {
      setPendingId(null);
    }
  };

  const save = async () => {
    if (!allAnswered || submit.isPending) return;
    setError(null);
    try {
      const response = await submit.mutateAsync({
        data: {
          lessonId,
          answers: questions.map((question) => ({
            questionId: question.id,
            selectedOption: answers[question.id],
          })),
        },
      });
      setSaved({
        scorePercent: response.scorePercent,
        correctAnswers: response.correctAnswers,
        totalQuestions: response.totalQuestions,
        earnedXp: response.earnedXp,
      });
      invalidate();
    } catch {
      setError('لم تُحفظ النتيجة. تحقق من اتصالك وأعد المحاولة.');
    }
  };

  const reset = () => {
    setAnswers({});
    setFeedback({});
    setSaved(null);
    setIndex(0);
    setError(null);
  };

  return (
    <div data-testid={`lesson-practice-${lessonId}`}>
      <div className="row-meta" style={{ marginBottom: 12 }} data-testid="practice-progress">
        السؤال {Math.min(index, questions.length - 1) + 1} من {questions.length} · أُجيب عن {answeredCount}
      </div>

      <div className="card" style={{ padding: 'clamp(16px,3vw,24px)' }}>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} data-testid={`practice-question-${current.id}`}>
          <legend style={{ fontWeight: 750, fontSize: 17, lineHeight: 1.9, marginBottom: 14 }}>
            {Math.min(index, questions.length - 1) + 1}. <MathText text={current.prompt} />
          </legend>
          <div className="list-stack">
            {current.options.map((option, optionIndex) => {
              const chosen = answers[current.id] === optionIndex;
              const isCorrectOption = Boolean(currentFeedback) && currentFeedback.correctOption === optionIndex;
              const isWrongChoice = Boolean(currentFeedback) && chosen && !currentFeedback.isCorrect;
              return (
                <button
                  type="button"
                  key={optionIndex}
                  className={`quiz-choice ${chosen ? 'selected' : ''}`}
                  style={
                    isCorrectOption
                      ? { borderColor: 'hsl(150 55% 38%)', background: 'hsl(150 55% 38% / 0.12)' }
                      : isWrongChoice
                        ? { borderColor: 'hsl(var(--destructive))', background: 'hsl(var(--destructive) / 0.08)' }
                        : undefined
                  }
                  onClick={() => void answer(optionIndex)}
                  disabled={Boolean(currentFeedback) || pendingId === current.id}
                  data-testid={`practice-choice-${current.id}-${optionIndex}`}
                >
                  <span className="choice-key">{String.fromCharCode(0x0623 + optionIndex)}</span>
                  <span><MathText text={option} /></span>
                  {isCorrectOption ? <Check size={16} /> : isWrongChoice ? <X size={16} /> : null}
                </button>
              );
            })}
          </div>
        </fieldset>

        {currentFeedback && (
          <div
            className="banner"
            role="status"
            style={{
              marginTop: 16,
              borderColor: currentFeedback.isCorrect ? 'hsl(150 55% 38%)' : 'hsl(var(--destructive))',
            }}
            data-testid={`practice-feedback-${current.id}`}
          >
            {currentFeedback.isCorrect ? <Check size={18} /> : <X size={18} />}
            <div>
              <strong>{currentFeedback.isCorrect ? 'إجابة صحيحة' : 'إجابة تحتاج مراجعة'}</strong>
              {!currentFeedback.isCorrect && (
                <>
                  <br />
                  <span>الإجابة الصحيحة: <MathText text={current.options[currentFeedback.correctOption] ?? '—'} /></span>
                </>
              )}
              <br />
              <span><MathText text={currentFeedback.explanation} /></span>
              <br />
              <span className="row-meta">
                <Zap size={14} style={{ verticalAlign: 'middle' }} />{' '}
                {currentFeedback.earnedXp > 0
                  ? `+${currentFeedback.earnedXp} نقطة خبرة`
                  : currentFeedback.isCorrect
                    ? 'إجابة صحيحة سابقة — لا نقاط إضافية.'
                    : 'لا نقاط لهذه المحاولة — راجع الشرح ثم تابع.'}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            data-testid="button-practice-prev"
          >
            <ArrowRight size={16} /> السابق
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIndex(Math.min(questions.length - 1, index + 1))}
            disabled={!currentFeedback || index >= questions.length - 1}
            data-testid="button-practice-next"
          >
            السؤال التالي <ArrowLeft size={16} />
          </button>
        </div>
      </div>

      {allAnswered && !saved && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          disabled={submit.isPending}
          onClick={() => void save()}
          data-testid="button-practice-save"
        >
          {submit.isPending ? 'جارٍ حفظ النتيجة...' : 'احفظ نتيجة الدرس'} <Trophy size={16} />
        </button>
      )}

      {saved && (
        <div className="hero-panel" style={{ padding: 22, marginTop: 18 }} data-testid="practice-summary">
          <span className="eyebrow" style={{ color: 'hsl(38 75% 75%)' }}>نتيجة الدرس</span>
          <h3 style={{ fontSize: 30, margin: '6px 0' }}>{saved.scorePercent}%</h3>
          <p style={{ margin: 0 }}>
            {saved.correctAnswers} إجابة صحيحة من {saved.totalQuestions}
            {saved.earnedXp > 0 ? ` · مكافأة إتمام الدرس +${saved.earnedXp} نقطة` : ' · لا مكافآت إضافية جديدة'}
          </p>
          <button
            type="button"
            className="btn btn-quiet"
            style={{ marginTop: 12 }}
            onClick={reset}
            data-testid="button-practice-reset"
          >
            <RotateCcw size={15} /> أعد المحاولة
          </button>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: 'hsl(var(--destructive))' }} data-testid="text-practice-error">
          {error}
        </p>
      )}
    </div>
  );
}
