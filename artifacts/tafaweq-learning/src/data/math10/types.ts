// أنواع محتوى الرياضيات للصف العاشر — الفصل الأول (المنهاج الأردني)
// كل درس مرتبط بأسئلته الخاصة، وكل سؤال يحمل مرجع صفحته في الكتاب.

export type MathQuestionKind = 'mcq' | 'truefalse';

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
  /** صفحة بداية الدرس في كتاب الطالب */
  page: number;
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
