import { pool } from "../../lib/db/src/index.ts";

// يعزل المعادلة من اليسار لليمين داخل النص العربي
const m = (s: string) => "\u2066" + s + "\u2069";
const SRC = "كتاب الطالب – رياضيات 10 – الفصل الأول – الوحدة 1، الدرس 1";
const NOTE = "صيغ من محتوى الدرس، بانتظار مراجعة معلم";
const TF = ["صح", "خطأ"];

type Q = {
  level: string; // سهل / متوسط / صعب (لا يُحفظ الآن: الجدول بلا حقل صعوبة)
  kind: "multiple_choice" | "true_false";
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  page: string;
};

const questions: Q[] = [
  {
    level: "سهل", kind: "multiple_choice", page: "ص 8–9",
    prompt: `ما جذور المعادلة ${m("x³ − 9x = 0")}؟`,
    options: [m("0 ، 3 ، −3"), m("3 ، −3 فقط"), m("0 ، 9 فقط"), m("0 ، 3 فقط")],
    correct: 0,
    explanation: `نخرج العامل المشترك x: ${m("x(x² − 9) = 0")}، ثم نحلل الفرق بين مربعين: ${m("x(x − 3)(x + 3) = 0")}. وبخاصية الضرب الصفري تكون الجذور 0 و 3 و −3.`,
  },
  {
    level: "سهل", kind: "true_false", page: "ص 8–9",
    prompt: `عند حل المعادلة ${m("2x³ = 18x")} يمكن قسمة طرفيها على x دون أن نخسر أي جذر.`,
    options: TF, correct: 1,
    explanation: `القسمة على x تُضيع الجذر x = 0. الصحيح أن نطرح 18x من الطرفين ونخرج العامل المشترك: ${m("2x(x − 3)(x + 3) = 0")}، فتكون الجذور 0 و 3 و −3.`,
  },
  {
    level: "سهل", kind: "multiple_choice", page: "ص 10",
    prompt: `أي مما يأتي هو تحليل ${m("x³ + 27")}؟`,
    options: [m("(x + 3)(x² − 3x + 9)"), m("(x + 3)(x² + 3x + 9)"), m("(x − 3)(x² + 3x + 9)"), m("(x + 3)(x² − 9)")],
    correct: 0,
    explanation: `${m("x³ + 27 = x³ + 3³")} مجموع مكعبين، وقاعدته ${m("a³ + b³ = (a + b)(a² − ab + b²)")}، فالتحليل ${m("(x + 3)(x² − 3x + 9)")}.`,
  },
  {
    level: "متوسط", kind: "multiple_choice", page: "ص 8–9",
    prompt: `ما جذور المعادلة ${m("x³ − 2x² − 8x = 0")}؟`,
    options: [m("0 ، 4 ، −2"), m("0 ، −4 ، 2"), m("4 ، −2 فقط"), m("0 ، 2 ، 4")],
    correct: 0,
    explanation: `نخرج x: ${m("x(x² − 2x − 8) = 0")}، ثم نحلل الثلاثية: ${m("x(x − 4)(x + 2) = 0")}. الجذور 0 و 4 و −2.`,
  },
  {
    level: "متوسط", kind: "multiple_choice", page: "ص 9–10",
    prompt: `ما جذور المعادلة ${m("x³ + 3x² − 4x − 12 = 0")}؟`,
    options: [m("−3 ، 2 ، −2"), m("3 ، 2 ، −2"), m("−3 فقط"), m("−3 ، 4 ، −4")],
    correct: 0,
    explanation: `بالتجميع: ${m("x²(x + 3) − 4(x + 3) = 0")} ثم ${m("(x + 3)(x² − 4) = 0")} أي ${m("(x + 3)(x − 2)(x + 2) = 0")}. الجذور −3 و 2 و −2.`,
  },
  {
    level: "متوسط", kind: "true_false", page: "ص 9",
    prompt: `المعادلة ${m("x³ − 2x² + 9x − 18 = 0")} لها جذر حقيقي واحد فقط هو 2.`,
    options: TF, correct: 0,
    explanation: `بالتجميع: ${m("(x − 2)(x² + 9) = 0")}. العامل ${m("x² + 9")} لا يساوي صفراً لأي عدد حقيقي، فالجذر الحقيقي الوحيد هو x = 2.`,
  },
  {
    level: "متوسط", kind: "multiple_choice", page: "ص 11",
    prompt: `ما الجذر الحقيقي للمعادلة ${m("27x³ + 1 = 0")}؟`,
    options: [m("−1/3"), m("1/3"), m("−3"), m("3")],
    correct: 0,
    explanation: `${m("27x³ = −1")} ومنها ${m("x³ = −1/27")}، وبأخذ الجذر التكعيبي ${m("x = −1/3")}. والعامل التربيعي في التحليل لا يعطي جذوراً حقيقية.`,
  },
  {
    level: "متوسط", kind: "multiple_choice", page: "ص 11",
    prompt: `كم جذراً حقيقياً للمعادلة ${m("x³ − 64 = 0")}؟`,
    options: ["1", "2", "3", "0"],
    correct: 0,
    explanation: `${m("x³ − 64 = (x − 4)(x² + 4x + 16)")}. العامل التربيعي مميزه سالب فلا جذور له، فيبقى جذر حقيقي واحد هو x = 4.`,
  },
  {
    level: "متوسط", kind: "multiple_choice", page: "ص 12–13",
    prompt: `ما جذور المعادلة ${m("x⁴ − 10x² + 9 = 0")}؟`,
    options: [m("±1 ، ±3"), m("1 ، 9"), m("±1 ، ±9"), m("1 ، 3 فقط")],
    correct: 0,
    explanation: `نفرض ${m("u = x²")} فتصبح ${m("u² − 10u + 9 = 0")} أي ${m("(u − 1)(u − 9) = 0")}، ومنها u = 1 أو u = 9. بالتعويض ${m("x² = 1")} أو ${m("x² = 9")} فتكون x = ±1 أو x = ±3.`,
  },
  {
    level: "متوسط", kind: "true_false", page: "ص 13",
    prompt: `عند حل ${m("x⁶ − 3x³ − 40 = 0")} بالتعويض ${m("u = x³")} نحصل على u = 8 أو u = −5، وهذان هما جذرا المعادلة الأصلية.`,
    options: TF, correct: 1,
    explanation: `هذا خطأ شائع: القيمتان هما قيمتا u وليستا قيمتي x. يجب التعويض بعد ذلك: ${m("x³ = 8")} فتكون x = 2، و ${m("x³ = −5")} فتكون x هي الجذر التكعيبي للعدد −5.`,
  },
  {
    level: "صعب", kind: "multiple_choice", page: "ص 12–13",
    prompt: `ما جذور المعادلة ${m("x⁶ − 7x³ − 8 = 0")}؟`,
    options: [m("2 ، −1"), m("8 ، −1"), m("2 ، 1"), m("−2 ، 1")],
    correct: 0,
    explanation: `نفرض ${m("u = x³")} فتصبح ${m("u² − 7u − 8 = 0")} أي ${m("(u − 8)(u + 1) = 0")}. إذن u = 8 أو u = −1، وبالتعويض ${m("x³ = 8")} فتكون x = 2، و ${m("x³ = −1")} فتكون x = −1.`,
  },
  {
    level: "صعب", kind: "multiple_choice", page: "ص 13–14",
    prompt: `صندوق على شكل متوازي مستطيلات ارتفاعه h، وطوله يقل عن ارتفاعه بمقدار 2 cm، وعرضه يقل عنه بمقدار 5 cm، وحجمه ${m("70 cm³")}. ما ارتفاع الصندوق؟`,
    options: [m("7 cm"), m("5 cm"), m("10 cm"), m("14 cm")],
    correct: 0,
    explanation: `${m("(h − 2)(h − 5)h = 70")} ومنها ${m("h³ − 7h² + 10h − 70 = 0")}. بالتجميع: ${m("h²(h − 7) + 10(h − 7) = 0")} أي ${m("(h − 7)(h² + 10) = 0")}. العامل ${m("h² + 10")} لا يساوي صفراً، فالارتفاع 7 cm (الطول 5 cm والعرض 2 cm).`,
  },
  {
    level: "صعب", kind: "multiple_choice", page: "ص 15",
    prompt: `حلّ طالب المعادلة ${m("3x⁴ − 12x² = 0")} هكذا: ${m("3x²(x² − 4) = 0")} ثم ${m("x² − 4 = 0")} فحصل على x = 2 أو x = −2. ما الخطأ في حله؟`,
    options: [
      "أهمل العامل 3x² فضاع الجذر x = 0",
      "لا يجوز إخراج 3x² عاملاً مشتركاً",
      "تحليل x² − 4 غير صحيح",
      "حله صحيح ولا خطأ فيه",
    ],
    correct: 0,
    explanation: `العامل ${m("3x²")} يساوي صفراً عندما x = 0، فهو جذر أيضاً. الحل الصحيح: ${m("3x²(x − 2)(x + 2) = 0")} والجذور 0 و 2 و −2.`,
  },
];

for (const q of questions) {
  if (q.options.length < 2 || (q.kind === "true_false" && q.options.length !== 2))
    throw new Error("عدد الخيارات غير صالح: " + q.prompt);
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length)
    throw new Error("رقم الإجابة الصحيحة غير صالح: " + q.prompt);
}

async function main() {
  const c = await pool.connect();
  let added = 0;
  let skipped = 0;
  try {
    await c.query("BEGIN");
    const lesson = await c.query(
      `SELECT l.id FROM curriculum_lessons l
       JOIN curriculum_units u ON u.id = l.unit_id
       JOIN curriculum_subjects s ON s.id = u.subject_id
       JOIN curriculum_grades g ON g.id = s.grade_id
       WHERE g.grade_number = 10 AND s.title = $1 AND u.title = $2 AND l.title = $3`,
      ["الرياضيات", "المعادلات", "حل معادلات خاصة"],
    );
    if (!lesson.rows[0]) throw new Error("الدرس غير موجود. شغّل سكربت الاستيراد الأول أولاً.");
    const lessonId = lesson.rows[0].id as number;

    for (const [i, q] of questions.entries()) {
      const dup = await c.query(
        "SELECT 1 FROM curriculum_questions WHERE lesson_id = $1 AND prompt = $2",
        [lessonId, q.prompt],
      );
      if (dup.rows[0]) {
        skipped++;
        continue;
      }
      await c.query(
        "INSERT INTO curriculum_questions (lesson_id, prompt, kind, options, correct_option, explanation, position, content_status, source_reference) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, 'draft', $8)",
        [lessonId, q.prompt, q.kind, JSON.stringify(q.options), q.correct, q.explanation, i + 1, `${SRC} (${q.page}) | ${NOTE}`],
      );
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
