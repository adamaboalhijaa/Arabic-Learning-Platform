import { pool } from "../../lib/db/src/index.ts";

const MISSING = "لم يُدخَل نص هذا الدرس بعد.";
const BOOK = "كتاب الطالب – رياضيات 10 – الفصل الأول";

const units: { title: string; lessons: [string, number][] }[] = [
  {
    title: "المعادلات",
    lessons: [
      ["حل معادلات خاصة", 8],
      ["حل نظام مكوَّن من معادلة خطية ومعادلة تربيعية", 18],
      ["حل نظام مكوَّن من معادلتين تربيعيتين", 25],
    ],
  },
  {
    title: "الدائرة",
    lessons: [
      ["أوتار الدائرة، وأقطارها، ومماسّاتها", 34],
      ["الأقواس والقطاعات الدائرية", 41],
      ["الزوايا في الدائرة", 47],
      ["معادلة الدائرة", 54],
    ],
  },
  {
    title: "حساب المثلثات",
    lessons: [
      ["النسب المثلثية", 66],
      ["النسب المثلثية للزوايا ضمن الدورة الواحدة", 74],
      ["تمثيل الاقترانات المثلثية", 82],
      ["حل المعادلات المثلثية", 88],
    ],
  },
  {
    title: "تطبيقات المثلثات",
    lessons: [
      ["الاتجاه من الشمال", 100],
      ["قانون الجيوب", 106],
      ["قانون جيوب التمام", 113],
      ["استعمال جيب الزاوية لإيجاد مساحة المثلث", 119],
      ["حل مسائل ثلاثية الأبعاد", 124],
    ],
  },
];

async function main() {
  const c = await pool.connect();
  let added = 0;
  let skipped = 0;
  try {
    await c.query("BEGIN");
    const getId = async (
      ins: string,
      a: unknown[],
      sel: string,
      b: unknown[],
    ) => {
      const r = await c.query(ins, a);
      const row = r.rows[0] ?? (await c.query(sel, b)).rows[0];
      return row.id as number;
    };
    const gradeId = await getId(
      "INSERT INTO curriculum_grades (grade_number, title, stage, content_status) VALUES ($1, $2, $3, 'draft') ON CONFLICT DO NOTHING RETURNING id",
      [10, "الصف العاشر", "المرحلة الأساسية"],
      "SELECT id FROM curriculum_grades WHERE grade_number = $1",
      [10],
    );
    const subjectId = await getId(
      "INSERT INTO curriculum_subjects (grade_id, title) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id",
      [gradeId, "الرياضيات"],
      "SELECT id FROM curriculum_subjects WHERE grade_id = $1 AND title = $2",
      [gradeId, "الرياضيات"],
    );
    for (const [ui, u] of units.entries()) {
      const unitId = await getId(
        "INSERT INTO curriculum_units (subject_id, title, position, content_status) VALUES ($1, $2, $3, 'draft') ON CONFLICT DO NOTHING RETURNING id",
        [subjectId, u.title, ui + 1],
        "SELECT id FROM curriculum_units WHERE subject_id = $1 AND title = $2",
        [subjectId, u.title],
      );
      for (const [li, [title, page]] of u.lessons.entries()) {
        const found = await c.query(
          "SELECT 1 FROM curriculum_lessons WHERE unit_id = $1 AND title = $2",
          [unitId, title],
        );
        if (found.rows[0]) {
          skipped++;
          continue;
        }
        await c.query(
          "INSERT INTO curriculum_lessons (unit_id, title, objective, explanation, objectives, content_status, source_reference) VALUES ($1, $2, $3, $3, '[]'::jsonb, 'draft', $4)",
          [
            unitId,
            title,
            MISSING,
            `${BOOK} – الوحدة ${ui + 1}، الدرس ${li + 1} (ص ${page})`,
          ],
        );
        added++;
      }
    }
    await c.query("COMMIT");
    console.log(`تم. دروس جديدة: ${added}، موجودة مسبقاً: ${skipped}`);
  } catch (err) {
    await c.query("ROLLBACK");
    console.error("فشل الاستيراد وتم التراجع:", err);
    process.exitCode = 1;
  } finally {
    c.release();
    await pool.end();
  }
}

main();
