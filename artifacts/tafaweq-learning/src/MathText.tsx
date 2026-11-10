import type { ReactNode } from "react";

// يعرض المعادلات كقطعة واحدة من اليسار لليمين دون أن تنكسر بين سطرين
const PATTERN = /\u2066([^\u2069]*)\u2069|([−±]\d+(?:\/\d+)?)/g;

export function MathText({ text }: { text: string | null | undefined }) {
  const value = text ?? "";
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of value.matchAll(PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(value.slice(last, index));
    parts.push(
      <bdi key={key++} dir="ltr" style={{ whiteSpace: "nowrap" }}>
        {match[1] ?? match[2]}
      </bdi>,
    );
    last = index + match[0].length;
  }
  if (last < value.length) parts.push(value.slice(last));
  return <>{parts}</>;
}
