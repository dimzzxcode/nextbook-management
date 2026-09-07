import { createHash, randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";

import { sessions } from "@/shared/database/schema";
import { db } from "@/shared/database";
import { authorizationError, notFoundError } from "@/shared/errors";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(params: {
  userId: number;
  tokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}) {
  const [session] = await db
    .insert(sessions)
    .values({
      userId: params.userId,
      tokenHash: params.tokenHash,
      userAgent: params.userAgent ?? null,
      ipAddress: params.ipAddress ?? null,
      expiresAt: params.expiresAt,
    })
    .returning({ id: sessions.id });

  return session;
}

export async function getSessionById(id: number) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
}

export async function getSessionByTokenHash(tokenHash: string) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1)
    .then((r) => r[0] ?? null);
}

export async function getActiveSessions(userId: number) {
  return db
    .select({
      id: sessions.id,
      userAgent: sessions.userAgent,
      ipAddress: sessions.ipAddress,
      createdAt: sessions.createdAt,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, new Date())))
    .orderBy(sessions.createdAt);
}

export async function revokeSession(sessionId: number, userId: number) {
  const session = await getSessionById(sessionId);
  if (!session) throw notFoundError("Session tidak ditemukan.");
  if (session.userId !== userId) throw authorizationError("Anda tidak dapat menghapus session milik user lain.");
  // Jangan throw jika sudah expired — tetap hapus
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function revokeCurrentSession(tokenHash: string) {
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function revokeAllUserSessions(userId: number) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
