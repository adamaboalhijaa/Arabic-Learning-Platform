// أنواع محتوى الرياضيات للصف العاشر — الفصل الأول (المنهاج الأردني)
// كل درس مرتبط بأسئلته الخاصة، وكل سؤال يحمل مرجع صفحته في الكتاب.

export type MathQuestionKind = 'mcq' | 'truefalse';

/** مستوى صعوبة السؤال: سهل، متوسط، متقدم. */
export type MathQuestionLevel = 'easy' | 'medium' | 'hard';

export const QUESTION_LEVEL_LABELS: Record<MathQuestionLevel, string> = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'متقدم',
};

export interface MathQuestion {
  /** معرّف ثابت مثل m10-u1-l1-q1 */
  id: string;
  kind: MathQuestionKind;
  /** نص السؤال، ويمكن تضمين الصيغ الرياضية بين {{ }} */
  prompt: string;
  /** خيارات الاختيار من متعدد، أو «صح/خطأ» لأسئلة الصح والخطأ */
  options: string[];
  /** فهرس الإجابة الصحيحة داخل options */
  correctOption: number;
  /** شرح مبسّط يظهر فور الإجابة */
  explanation: string;
  /** مرجع الصفحة في كتاب الطالب */
  page: string;
  /** مستوى الصعوبة؛ إن لم يُحدَّد يُستنتج عند تحميل المنهاج */
  level?: MathQuestionLevel;
}

export interface MathFormula {
  label: string;
  value: string;
}

export interface MathExample {
  prompt: string;
  solution: string;
}

export interface MathLesson {
  id: string;
  title: string;
  /** صفحة بداية الدرس في كتاب الطالب (تُترك فارغة إذا لم يتوفر رقم الصفحة) */
  page?: number;
  durationMinutes: number;
  /** هدف الدرس بجملة واحدة */
  objective: string;
  /** ماذا سيتعلم الطالب */
  objectives: string[];
  /** شرح الدرس، فقرات منفصلة بسطر جديد */
  explanation: string;
  formulas: MathFormula[];
  examples: MathExample[];
  questions: MathQuestion[];
}

export interface MathUnit {
  id: string;
  title: string;
  description: string;
  lessons: MathLesson[];
}

export const TRUE_FALSE_OPTIONS = ['صح', 'خطأ'] as const;

/** مستوى السؤال الفعلي، مع قيمة افتراضية آمنة. */
export function questionLevel(question: MathQuestion): MathQuestionLevel {
  return question.level ?? 'medium';
}

/** مرجع الدرس داخل الكتاب عندما لا تتوفر أرقام صفحات دقيقة. */
export function lessonReference(unitTitle: string, lessonTitle: string): string {
  return `${unitTitle} — ${lessonTitle}`;
}
