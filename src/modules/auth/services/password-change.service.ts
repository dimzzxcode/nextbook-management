import { and, eq, sql } from "drizzle-orm";
import { getAuditMeta } from "@/shared/utils/audit-meta";

import { db } from "@/shared/database";
import { sessions, users } from "@/shared/database/schema";
import { authenticationError } from "@/shared/errors";
import { parseOrThrow } from "@/shared/validation/helpers";
import { changePasswordSchema } from "@/shared/validation/auth";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { hashPassword, verifyPassword } from "@/modules/auth/services/password.service";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import { sha256 } from "@/shared/utils/hash";
import { getRefreshToken } from "@/modules/auth/services/cookie.service";

export async function changePassword(rawInput: unknown) {
  const currentUser = await requireAuth();
  const input = parseOrThrow(changePasswordSchema, rawInput);

  const user = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1)
    .then((r) => r[0]);

  if (!user) throw authenticationError("User tidak ditemukan.");

  const ok = await verifyPassword(user.passwordHash, input.currentPassword);
  if (!ok) throw authenticationError("Kata sandi saat ini tidak valid.");

  const newHash = await hashPassword(input.newPassword);

  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, currentUser.id));

  // Revoke other sessions (keep current)
  const currentRefresh = await getRefreshToken().catch(() => null);
  const currentHash = currentRefresh ? sha256(currentRefresh) : null;

  if (currentHash) {
    await db
      .delete(sessions)
      .where(and(eq(sessions.userId, currentUser.id), sql`${sessions.tokenHash} != ${currentHash}`));
  } else {
    // Fallback: hapus semua (akan logout)
    await db.delete(sessions).where(eq(sessions.userId, currentUser.id));
  }

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: currentUser.id,
    action: "PASSWORD_CHANGED",
    resource: "user",
    resourceId: String(currentUser.id),
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return { success: true };
}

// Alternative helper tanpa cookie dependency untuk testing
export async function changePasswordForUser(
  userId: number,
  currentPassword: string,
  newPassword: string
) {
  const user = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1).then(r=>r[0]);
  if(!user) throw authenticationError("User tidak ditemukan.");
  const ok = await verifyPassword(user.passwordHash, currentPassword);
  if(!ok) throw authenticationError("Kata sandi saat ini tidak valid.");
  const newHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId));
  // revoke other sessions
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await logAuditEvent({ userId, action: "PASSWORD_CHANGED", resource: "user", resourceId: String(userId) });
}
