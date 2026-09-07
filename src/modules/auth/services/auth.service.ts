import { eq } from "drizzle-orm";

import { db } from "@/shared/database";
import { roles, sessions, users } from "@/shared/database/schema";
import { conflictError, authenticationError } from "@/shared/errors";
import { parseOrThrow } from "@/shared/validation/helpers";
import { loginSchema, registerSchema } from "@/shared/validation/auth";
import { COOKIE, SESSION } from "@/shared/constants/app";
import { ROLES } from "@/shared/constants/roles";
import { sha256 } from "@/shared/utils/hash";

import { logAuditEvent } from "@/modules/audit/services/audit.service";
import { hashPassword, verifyPassword } from "./password.service";
import { generateAccessToken, generateRefreshToken } from "./jwt.service";
import { createSession } from "./session.service";
import { randomBytes } from "crypto";

function getJwtSecrets() {
  // Lazy read env to avoid top-level import issues with @t3-oss/env
  const secret = process.env.JWT_SECRET;
  const refresh = process.env.JWT_REFRESH_SECRET;
  if (!secret || !refresh) throw new Error("JWT secrets belum diatur");
  return { secret, refresh };
}

export async function registerUser(
  rawInput: unknown,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const input = parseOrThrow(registerSchema, rawInput);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)
    .then((r) => r[0]);

  if (existing) {
    throw conflictError("Email sudah terdaftar.");
  }

  const userRole = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, ROLES.USER))
    .limit(1)
    .then((r) => r[0]);

  if (!userRole) throw new Error("Role USER belum tersedia. Jalankan seed.");

  const passwordHash = await hashPassword(input.password);

  const [created] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      roleId: userRole.id,
    })
    .returning({ id: users.id, email: users.email, name: users.name });

  await logAuditEvent({
    userId: created.id,
    action: "USER_REGISTERED",
    resource: "user",
    resourceId: String(created.id),
    metadata: { email: created.email },
    ipAddress: meta?.ipAddress ?? null,
    userAgent: meta?.userAgent ?? null,
  });

  return created;
}

export async function loginUser(
  rawInput: unknown,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const input = parseOrThrow(loginSchema, rawInput);

  const user = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      passwordHash: users.passwordHash,
      roleId: users.roleId,
    })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)
    .then((r) => r[0]);

  // Generic error — jangan bocorkan email vs password
  const generic = authenticationError("Email atau password tidak valid.");

  if (!user) throw generic;

  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) throw generic;

  // Ambil nama role untuk JWT
  const role = await db
    .select({ name: roles.name })
    .from(roles)
    .where(eq(roles.id, user.roleId))
    .limit(1)
    .then((r) => r[0]);

  const roleName = role?.name ?? ROLES.USER;

  const { secret, refresh } = getJwtSecrets();

  const expiresAt = new Date(
    Date.now() + SESSION.DEFAULT_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );

  const accessToken = await generateAccessToken(
    { sub: String(user.id), email: user.email, role: roleName, roleId: user.roleId },
    secret,
    "15m"
  );

  // Buat session dengan dummy hash dulu untuk dapat id
  const dummyHash = sha256(randomBytes(32).toString("hex"));
  const session = await createSession({
    userId: user.id,
    tokenHash: dummyHash,
    userAgent: meta?.userAgent ?? null,
    ipAddress: meta?.ipAddress ?? null,
    expiresAt,
  });

  const refreshToken = await generateRefreshToken(
    { sub: String(user.id), jti: String(session.id) },
    refresh,
    "7d"
  );

  const tokenHash = sha256(refreshToken);
  await db
    .update(sessions)
    .set({ tokenHash })
    .where(eq(sessions.id, session.id));

  await logAuditEvent({
    userId: user.id,
    action: "USER_LOGIN",
    resource: "user",
    resourceId: String(user.id),
    metadata: { sessionId: session.id },
    ipAddress: meta?.ipAddress ?? null,
    userAgent: meta?.userAgent ?? null,
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: roleName },
    accessToken,
    refreshToken,
    sessionId: session.id,
    expiresAt,
  };
}

export const AUTH_COOKIE = COOKIE.AUTH_TOKEN;
