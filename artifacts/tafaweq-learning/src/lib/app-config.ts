import { publishableKeyFromHost } from '@clerk/react/internal';

// إعدادات مشتركة بين التطبيق وقسم الرياضيات، حتى لا يعتمد أي جزء على Clerk للعمل.
export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

export const clerkPubKey = publishableKeyFromHost(
  typeof window === 'undefined' ? '' : window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// وضع الدراسة المحلي: يعمل قسم الرياضيات وحفظ التقدم دون تسجيل دخول أو خادم.
export const isLocalStudyMode = !clerkPubKey;

export function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}
