import { createInsertSchema } from "drizzle-zod";
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { gradesTable, lessonsTable } from "./curriculum";

export const studentAccountsTable = pgTable(
  "student_accounts",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    displayName: text("display_name").notNull().default("طالب جديد"),
    gradeId: integer("grade_id").references(() => gradesTable.id, {
      onDelete: "set null",
    }),
    role: text("role").notNull().default("student"),
    status: text("status").notNull().default("active"),
    totalXp: integer("total_xp").notNull().default(0),
    streakDays: integer("streak_days").notNull().default(0),
    lastActiveDay: text("last_active_day"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("student_accounts_clerk_user_uq").on(table.clerkUserId),
    index("student_accounts_grade_idx").on(table.gradeId),
    index("student_accounts_xp_idx").on(table.totalXp),
  ],
);

export const quizAttemptsTable = pgTable(
  "quiz_attempts",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => studentAccountsTable.id, { onDelete: "restrict" }),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessonsTable.id, { onDelete: "restrict" }),
    totalQuestions: integer("total_questions").notNull(),
    correctAnswers: integer("correct_answers").notNull(),
    scorePercent: integer("score_percent").notNull(),
    earnedXp: integer("earned_xp").notNull().default(0),
    dayKey: text("day_key").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("quiz_attempts_student_idx").on(table.studentId, table.completedAt),
    index("quiz_attempts_lesson_idx").on(table.lessonId, table.studentId),
  ],
);

export const studentAchievementsTable = pgTable(
  "student_achievements",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => studentAccountsTable.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("student_achievements_student_code_uq").on(
      table.studentId,
      table.code,
    ),
    index("student_achievements_student_idx").on(table.studentId, table.earnedAt),
  ],
);

export const insertStudentAccountSchema = createInsertSchema(
  studentAccountsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuizAttemptSchema = createInsertSchema(quizAttemptsTable).omit({
  id: true,
});
export const insertStudentAchievementSchema = createInsertSchema(
  studentAchievementsTable,
).omit({ id: true, earnedAt: true });

export type StudentAccount = typeof studentAccountsTable.$inferSelect;
export type InsertStudentAccount = typeof studentAccountsTable.$inferInsert;
export type QuizAttempt = typeof quizAttemptsTable.$inferSelect;
export type InsertQuizAttempt = typeof quizAttemptsTable.$inferInsert;
export type StudentAchievement = typeof studentAchievementsTable.$inferSelect;
