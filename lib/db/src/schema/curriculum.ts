import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const gradesTable = pgTable(
  "curriculum_grades",
  {
    id: serial("id").primaryKey(),
    gradeNumber: integer("grade_number").notNull(),
    title: text("title").notNull(),
    stage: text("stage").notNull(),
    contentStatus: text("content_status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("curriculum_grades_number_uq").on(table.gradeNumber)],
);

export const subjectsTable = pgTable(
  "curriculum_subjects",
  {
    id: serial("id").primaryKey(),
    gradeId: integer("grade_id")
      .notNull()
      .references(() => gradesTable.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("curriculum_subjects_grade_idx").on(table.gradeId),
    uniqueIndex("curriculum_subjects_grade_title_uq").on(
      table.gradeId,
      table.title,
    ),
  ],
);

export const unitsTable = pgTable(
  "curriculum_units",
  {
    id: serial("id").primaryKey(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjectsTable.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    position: integer("position").notNull().default(0),
    contentStatus: text("content_status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("curriculum_units_subject_idx").on(table.subjectId),
    uniqueIndex("curriculum_units_subject_title_uq").on(
      table.subjectId,
      table.title,
    ),
  ],
);

export const lessonsTable = pgTable(
  "curriculum_lessons",
  {
    id: serial("id").primaryKey(),
    unitId: integer("unit_id")
      .notNull()
      .references(() => unitsTable.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    objective: text("objective").notNull(),
    explanation: text("explanation").notNull(),
    objectives: jsonb("objectives")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    durationMinutes: integer("duration_minutes").notNull().default(10),
    contentStatus: text("content_status").notNull().default("draft"),
    sourceReference: text("source_reference"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("curriculum_lessons_unit_idx").on(table.unitId)],
);

export const questionsTable = pgTable(
  "curriculum_questions",
  {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessonsTable.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    kind: text("kind").notNull(),
    options: jsonb("options")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    correctOption: integer("correct_option").notNull(),
    explanation: text("explanation").notNull(),
    position: integer("position").notNull().default(0),
    contentStatus: text("content_status").notNull().default("draft"),
    sourceReference: text("source_reference"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("curriculum_questions_lesson_idx").on(table.lessonId)],
);

export const insertGradeSchema = createInsertSchema(gradesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertSubjectSchema = createInsertSchema(subjectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertUnitSchema = createInsertSchema(unitsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertLessonSchema = createInsertSchema(lessonsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertQuestionSchema = createInsertSchema(questionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Grade = typeof gradesTable.$inferSelect;
export type InsertGrade = typeof gradesTable.$inferInsert;
export type Subject = typeof subjectsTable.$inferSelect;
export type InsertSubject = typeof subjectsTable.$inferInsert;
export type Unit = typeof unitsTable.$inferSelect;
export type InsertUnit = typeof unitsTable.$inferInsert;
export type Lesson = typeof lessonsTable.$inferSelect;
export type InsertLesson = typeof lessonsTable.$inferInsert;
export type Question = typeof questionsTable.$inferSelect;
export type InsertQuestion = typeof questionsTable.$inferInsert;
