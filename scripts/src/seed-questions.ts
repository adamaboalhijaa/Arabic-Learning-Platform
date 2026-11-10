import { readFileSync } from "node:fs";
import { pool } from "../../lib/db/src/index.ts";

const d = JSON.parse(readFileSync(process.argv[2], "utf8"));
const fix = (s: string) => s.replace(/\{\{(.*?)\}\}/g, "\u2066$1\u2069");
const NOTE = "صيغ من محتوى الدرس، بانتظار مراجعة معلم";

async function main() {
  const c = await pool.connect();
  let added = 0, skipped = 0;
  try {
    await c.query("BEGIN");
    const l = await c.query(
      `SELECT l.id FROM curriculum_lessons l
       JOIN curriculum_units u ON u.id = l.unit_id
       JOIN curriculum_subjects s ON s.id = u.subject_id
       JOIN curriculum_grades g ON g.id = s.grade_id
       WHERE g.grade_number = $1 AND s.title = $2 AND l.source_reference LIKE '%' || $3`,
      [d.grade, d.subject, d.ref]);
    if (l.rows.length !== 1) throw new Error("لم أجد الدرس بالضبط: " + d.ref + " (" + l.rows.length + ")");
    for (const [i, [kind, p, o, a, e, pg]] of d.qs.entries()) {
      const kinds: Record<string, string> = { mc: "multiple_choice", tf: "true_false" };
      const opts = (kind === "tf" ? ["صح", "خطأ"] : o).map(fix);
      if (!kinds[kind] || opts.length < 2 || !Number.isInteger(a) || a < 0 || a >= opts.length)
        throw new Error("سؤال غير صالح رقم " + (i + 1));
      const prompt = fix(p);
      const dup = await c.query("SELECT 1 FROM curriculum_questions WHERE lesson_id = $1 AND prompt = $2", [l.rows[0].id, prompt]);
      if (dup.rows[0]) { skipped++; continue; }
      await c.query(
        "INSERT INTO curriculum_questions (lesson_id, prompt, kind, options, correct_option, explanation, position, content_status, source_reference) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, 'draft', $8)",
        [l.rows[0].id, prompt, kinds[kind], JSON.stringify(opts), a, fix(e), i + 1, `${d.book} (${pg}) | ${NOTE}`]);
      added++;
    }
    await c.query("COMMIT");
    console.log(`تم. أسئلة جديدة: ${added}، موجودة مسبقاً: ${skipped}`);
  } catch (err) {
    await c.query("ROLLBACK");
    console.error("فشل الإدخال وتم التراجع:", err);
    process.exitCode = 1;
  } finally {
    c.release();
    await pool.end();
  }
}

main();
