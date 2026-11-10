/**
 * توحيد النصوص العربية واشتقاق المعرّفات.
 * الغرض: اعتبار «الوحدة الأولى» و«الوحده الاولي» العنصر نفسه عند الاستيراد،
 * وبذلك لا تتكرر الوحدات أو الدروس أو الأسئلة.
 */
export function normalizeKey(value: string): string {
  return String(value ?? '')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase();
}

/** معرّف ثابت قصير مبني على المسار الموحّد. */
export function stableId(prefix: string, path: string): string {
  let hash = 0x811c9dc5;
  const key = normalizeKey(path);
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${prefix}_${hash.toString(36)}`;
}

export function pathKey(...parts: Array<string | number>): string {
  return parts.map((part) => normalizeKey(String(part))).join('/');
}
