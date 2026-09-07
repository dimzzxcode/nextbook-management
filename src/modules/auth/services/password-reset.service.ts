import { randomBytes } from "crypto";
import { getAuditMeta } from "@/shared/utils/audit-meta";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/shared/database";
import { passwordResetTokens, users } from "@/shared/database/schema";
import { parseOrThrow } from "@/shared/validation/helpers";
import { PASSWORD } from "@/shared/constants/app";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import { sha256 } from "@/shared/utils/hash";
import { hashPassword } from "./password.service";

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Masukkan alamat email yang valid."),
});

const resetSchema = z
  .object({
    token: z.string().trim().min(1, "Token wajib diisi."),
    newPassword: z.string().min(PASSWORD.MIN_LENGTH, `Kata sandi minimal ${PASSWORD.MIN_LENGTH} karakter.`).max(100),
    confirmNewPassword: z.string().min(1, "Konfirmasi wajib diisi."),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Konfirmasi kata sandi tidak cocok.",
    path: ["confirmNewPassword"],
  });

export async function requestPasswordReset(rawInput: unknown) {
  const input = parseOrThrow(forgotSchema, rawInput);
  const meta = await getAuditMeta();

  const user = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1).then(r=>r[0]);

  // Generic response — jangan bocorkan apakah email ada
  if (!user) {
    // Tetap log attempt tanpa userId untuk audit? Tidak perlu
    return { success: true, message: "Jika email terdaftar, tautan reset telah dikirim." };
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

  // Invalidate previous unused tokens for user
  await db.delete(passwordResetTokens).where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  await logAuditEvent({
    userId: user.id,
    action: "PASSWORD_RESET_REQUESTED",
    resource: "user",
    resourceId: String(user.id),
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  // Untuk dev: log token ke console (tidak ke response production)
  // Di production, kirim via email
  if (process.env.NODE_ENV !== "production") {
    console.log(`[PasswordReset] token for ${input.email}: ${token} (hash ${tokenHash.slice(0,8)}...) expires ${expiresAt.toISOString()}`);
  }

  // Return generic + token for testing in dev (akan dihapus di prod)
  const isDev = process.env.NODE_ENV !== "production";
  return {
    success: true,
    message: "Jika email terdaftar, tautan reset telah dikirim.",
    ...(isDev ? { token } : {}),
  };
}

export async function resetPassword(rawInput: unknown) {
  const input = parseOrThrow(resetSchema, rawInput);
  const meta = await getAuditMeta();

  const tokenHash = sha256(input.token);

  const record = await db
    .select()
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date())))
    .limit(1)
    .then(r=>r[0]);

  if (!record) {
    throw new Error("Token tidak valid atau telah kedaluwarsa.");
  }

  const newHash = await hashPassword(input.newPassword);

  await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, record.userId));

  // Mark used
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));

  // Revoke all sessions for security
  const { sessions } = await import("@/shared/database/schema");
  await db.delete(sessions).where(eq(sessions.userId, record.userId));

  await logAuditEvent({
    userId: record.userId,
    action: "PASSWORD_CHANGED",
    resource: "user",
    resourceId: String(record.userId),
    metadata: { via: "reset" },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return { success: true, message: "Kata sandi berhasil direset. Silakan login." };
}

// Untuk testing: ambil token langsung (dev only)
export async function getResetTokenForTesting(email: string) {
  const user = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1).then(r=>r[0]);
  if(!user) return null;
  const rec = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id)).orderBy(passwordResetTokens.createdAt).limit(1).then(r=>r[0]);
  return rec;
}
