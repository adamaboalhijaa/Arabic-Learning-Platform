/**
 * جسر المصادقة.
 *
 * السبب: في النشر الثابت لا يوجد مفتاح Clerk حقيقي، وكان الكود يشتق مفتاحًا من
 * اسم النطاق فيحاول تحميل clerk.<host>/npm/@clerk/clerk-js@6 فيفشل ويُسجّل خطأ
 * JavaScript في كل صفحة. هنا نمرّر قيم Clerk الحقيقية فقط عند وجود مفتاح مهيّأ،
 * وإلا تعمل الصفحات بجلسة الطالب المحلية دون تحميل أي سكربت خارجي.
 *
 * لا تغيير في التصميم: نفس المكوّنات تستخدم نفس الأسماء (useAuth / useClerk).
 */
import { createContext, useContext, type ReactNode } from 'react';
import { useAuth as useClerkAuth, useClerk as useClerkInstance } from '@clerk/react';

export const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

type AuthValue = { isLoaded: boolean; isSignedIn: boolean; userId: string | null };
type ClerkValue = {
  signOut: (options?: { redirectUrl?: string }) => Promise<void>;
  addListener: (listener: (payload: unknown) => void) => () => void;
};

const fallbackAuth: AuthValue = { isLoaded: true, isSignedIn: false, userId: null };
const fallbackClerk: ClerkValue = {
  signOut: async () => {},
  addListener: () => () => {},
};

const AuthContext = createContext<AuthValue>(fallbackAuth);
const ClerkContext = createContext<ClerkValue>(fallbackClerk);

/** يُركّب داخل ClerkProvider فقط، ويمرّر قيمه الحقيقية إلى بقية الشجرة. */
export function ClerkBridge({ children }: { children: ReactNode }) {
  const auth = useClerkAuth();
  const clerk = useClerkInstance();
  return (
    <AuthContext.Provider value={auth as unknown as AuthValue}>
      <ClerkContext.Provider value={clerk as unknown as ClerkValue}>{children}</ClerkContext.Provider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useClerk = () => useContext(ClerkContext);
