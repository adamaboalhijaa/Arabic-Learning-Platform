/**
 * جلسة طالب محلية: تُستخدم عندما لا تتوفر خدمة تسجيل الدخول السحابية
 * (مثل النشر الثابت). تحفظ اسم الطالب في المتصفح فقط، وتعمل مع تقدّم
 * الرياضيات المحفوظ محليًا أيضًا.
 */
const SESSION_KEY = 'tafaweq:student-session';

export interface LocalStudent {
  id: string;
  name: string;
  createdAt: string;
}

function safeParse(raw: string | null): LocalStudent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<LocalStudent> | null;
    if (!value || typeof value.name !== 'string' || !value.name.trim()) return null;
    return {
      id: typeof value.id === 'string' && value.id ? value.id : 'local-student',
      name: value.name.trim(),
      createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readLocalStudent(): LocalStudent | null {
  if (typeof window === 'undefined') return null;
  try {
    return safeParse(window.localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function saveLocalStudent(name: string): LocalStudent {
  const trimmed = name.trim();
  const existing = readLocalStudent();
  const student: LocalStudent = {
    id: existing?.id ?? 'local-student',
    name: trimmed,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(student));
  } catch {
    /* التخزين قد يكون معطلًا؛ تبقى الجلسة صالحة لهذه الصفحة فقط */
  }
  window.dispatchEvent(new Event('tafaweq:session-change'));
  return student;
}

export function clearLocalStudent(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* لا شيء لنفعله إذا كان التخزين معطلًا */
  }
  window.dispatchEvent(new Event('tafaweq:session-change'));
}
