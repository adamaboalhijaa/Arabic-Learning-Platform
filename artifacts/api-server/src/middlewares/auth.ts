import { clerkClient, getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import type { Request, RequestHandler } from "express";
import { db, studentAccountsTable } from "@workspace/db";

const bootstrapEmailChecks = new Set<string>();

async function grantConfiguredInitialAdmin(
  account: typeof studentAccountsTable.$inferSelect,
) {
  const allowedEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  if (
    !allowedEmail ||
    account.role === "admin" ||
    bootstrapEmailChecks.has(account.clerkUserId)
  ) {
    return account;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(account.clerkUserId);
  bootstrapEmailChecks.add(account.clerkUserId);
  if (user.primaryEmailAddress?.verification?.status !== "verified") {
    return account;
  }
  const primaryEmail = user.primaryEmailAddress.emailAddress
    .trim()
    .toLowerCase();
  if (!primaryEmail || primaryEmail !== allowedEmail) return account;

  const [updated] = await db
    .update(studentAccountsTable)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(studentAccountsTable.id, account.id))
    .returning();
  return updated ?? account;
}

export async function getOrCreateStudentAccount(
  req: Request,
): Promise<typeof studentAccountsTable.$inferSelect | null> {
  const clerkUserId = getAuth(req).userId;
  if (!clerkUserId) return null;

  const [existing] = await db
    .select()
    .from(studentAccountsTable)
    .where(eq(studentAccountsTable.clerkUserId, clerkUserId))
    .limit(1);
  if (existing) return grantConfiguredInitialAdmin(existing);

  const [created] = await db
    .insert(studentAccountsTable)
    .values({ clerkUserId })
    .onConflictDoNothing({ target: studentAccountsTable.clerkUserId })
    .returning();
  if (created) return grantConfiguredInitialAdmin(created);

  const [raced] = await db
    .select()
    .from(studentAccountsTable)
    .where(eq(studentAccountsTable.clerkUserId, clerkUserId))
    .limit(1);
  return raced ? grantConfiguredInitialAdmin(raced) : null;
}

export const requireActiveStudent: RequestHandler = async (
  req,
  res,
  next,
): Promise<void> => {
  const account = await getOrCreateStudentAccount(req);
  if (!account) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  if (account.status !== "active") {
    res.status(403).json({ error: "This account is disabled" });
    return;
  }
  next();
};

export const requireAdmin: RequestHandler = async (
  req,
  res,
  next,
): Promise<void> => {
  const account = await getOrCreateStudentAccount(req);
  if (!account) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  if (account.status !== "active" || account.role !== "admin") {
    res.status(403).json({ error: "Admin role required" });
    return;
  }
  next();
};
