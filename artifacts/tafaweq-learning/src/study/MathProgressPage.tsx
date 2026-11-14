import { Link } from 'wouter';
import { CheckCircle2, RotateCcw, Trophy, Zap } from 'lucide-react';
import { levelInfo, lessonScore, resetProgress, useMathProgress } from '../lib/math-progress';
import { useMathBundle } from './math-context';
import { StudyShell } from './StudyShell';

export function MathProgressPage() {
  const { base, meta, MATH10_LESSONS, MATH10_UNITS, findLesson, lessonQuestionCount } = useMathBundle();
  const progress = useMathProgress();
  const level = levelInfo(progress.xp);
  const mastered = MATH10_LESSONS.filter((lesson) => progress.lessons[lesson.id]?.mastered).length;
  const perfect = MATH10_LESSONS.filter((lesson) => progress.lessons[lesson.id]?.perfect).length;
  const correctAnswers = Object.values(progress.answers).filter((answer) => answer.correct).length;

  const handleReset = () => {
    if (typeof window !== 'undefined' && !window.confirm('هل تريد حذف تقدمك في الرياضيات ونقاط XP؟ لا يمكن التراجع.')) return;
    resetProgress();
  };

  return (
    <StudyShell>
      <section className="study-hero">
        <p className="study-eyebrow">تقدّمي ونتائجي</p>
        <h1 className="study-title">تقدّمك في الرياضيات — {meta.grade}</h1>
        <p className="study-sub">يُحفظ تقدمك تلقائيًا على هذا الجهاز، مع أفضل نتيجة لكل درس وعدد المحاولات ونقاط الخبرة.</p>

        <div className="study-level">
          <div className="study-level-head">
            <span><Zap size={15} style={{ verticalAlign: '-2px', marginInlineEnd: 6 }} />المستوى {level.level} · {level.title}</span>
            <span className="study-meta">{progress.xp} XP{level.nextMinXp ? ` · ${level.remaining} XP للمستوى التالي` : ' · أعلى مستوى'}</span>
          </div>
          <div className="study-bar"><span style={{ width: `${level.progress}%` }} /></div>
        </div>

        <div className="study-stats">
          <div className="study-stat"><Trophy size={18} /><div><strong>{progress.xp}</strong><span>إجمالي XP</span></div></div>
          <div className="study-stat"><CheckCircle2 size={18} /><div><strong>{mastered}/{MATH10_LESSONS.length}</strong><span>دروس مُتقنة</span></div></div>
          <div className="study-stat"><CheckCircle2 size={18} /><div><strong>{perfect}</strong><span>درجات كاملة</span></div></div>
          <div className="study-stat"><CheckCircle2 size={18} /><div><strong>{correctAnswers}/{lessonQuestionCount()}</strong><span>أسئلة أُجيبت بشكل صحيح</span></div></div>
        </div>
      </section>

      {MATH10_UNITS.map((unit, unitIndex) => (
        <section className="study-card" key={unit.id} style={{ marginTop: 18 }}>
          <div className="study-unit-head">
            <h2 className="study-card-title" style={{ margin: 0 }}>الوحدة {unitIndex + 1}: {unit.title}</h2>
            <Link href={`${base}/unit/${unit.id}`} className="study-link">دروس الوحدة</Link>
          </div>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="study-table">
              <thead>
                <tr>
                  <th>الدرس</th>
                  <th>أفضل نتيجة</th>
                  <th>المحاولات</th>
                  <th>الحالة</th>
                  <th>آخر محاولة</th>
                </tr>
              </thead>
              <tbody>
                {unit.lessons.map((lesson) => {
                  const record = progress.lessons[lesson.id];
                  const score = lessonScore(progress, lesson.id, lesson.questions.length);
                  return (
                    <tr key={lesson.id}>
                      <td><Link href={`${base}/lesson/${lesson.id}`} className="study-link">{lesson.title}</Link></td>
                      <td>{record ? `${record.bestCorrect}/${lesson.questions.length} (${score}%)` : '—'}</td>
                      <td>{record?.attempts ?? 0}</td>
                      <td>
                        {record ? (
                          <span className={`study-badge ${record.mastered ? 'good' : 'warn'}`}>
                            {record.perfect ? 'درجة كاملة' : record.mastered ? 'مُتقن' : 'قيد التدريب'}
                          </span>
                        ) : (
                          <span className="study-badge">لم يبدأ</span>
                        )}
                      </td>
                      <td>{record ? new Date(record.lastAttemptAt).toLocaleDateString('ar-JO') : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="study-card" style={{ marginTop: 18 }}>
        <h2 className="study-card-title">آخر النتائج</h2>
        {progress.results.length === 0 ? (
          <p className="study-sub" style={{ marginBottom: 0 }}>لا توجد نتائج بعد. ابدأ بأي درس من <Link href={base} className="study-link">قائمة الوحدات</Link>.</p>
        ) : (
          <ul className="study-results-list">
            {[...progress.results].reverse().slice(0, 12).map((result) => {
              const lesson = findLesson(result.lessonId);
              return (
                <li key={`${result.lessonId}-${result.at}`}>
                  <span>{lesson ? lesson.title : result.lessonId}</span>
                  <span className="study-meta">
                    {result.correct}/{result.total} · {new Date(result.at).toLocaleString('ar-JO')} · +{result.xpEarned} XP
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="study-actions">
          <button type="button" className="btn btn-quiet" onClick={handleReset} data-testid="btn-reset-progress">
            <RotateCcw size={16} /> إعادة ضبط التقدم
          </button>
        </div>
      </section>
    </StudyShell>
  );
}
