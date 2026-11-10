import { pool } from "../../lib/db/src/index.ts";

// يحرّك الإجابة الصحيحة من الخيار الأول إلى موضع آخر ثابت لكل سؤال. آمن للتكرار.
async function main() {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const r = await c.query(
      "SELECT id, options, correct_option FROM curriculum_questions WHERE kind = 'multiple_choice' AND correct_option = 0 ORDER BY id");
    let moved = 0;
    for (const q of r.rows) {
      const n = q.options.length;
      const k = (q.id * 7 + 3) % n;
      if (k === 0) continue;
      const opts = q.options.map((_: string, j: number) => q.options[(j - k + n) % n]);
      await c.query(
        "UPDATE curriculum_questions SET options = $1::jsonb, correct_option = $2 WHERE id = $3",
        [JSON.stringify(opts), k, q.id]);
      moved++;
    }
    await c.query("COMMIT");
    console.log(`تم. أعيد ترتيب خيارات ${moved} سؤالاً من ${r.rows.length}`);
  } catch (err) {
    await c.query("ROLLBACK");
    console.error("فشل وتم التراجع:", err);
    process.exitCode = 1;
  } finally {
    c.release();
    await pool.end();
  }
}

main();
