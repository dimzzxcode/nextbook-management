import { eq } from "drizzle-orm";

import { db } from "@/shared/database";
import { roles, users } from "@/shared/database/schema";
import { authenticationError } from "@/shared/errors";
import { getAccessToken } from "./cookie.service";
import { verifyAccessToken, type AccessTokenPayload } from "./jwt.service";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  roleId: number;
  role: string;
  tokenPayload: AccessTokenPayload;
};

export async function requireAuth(): Promise<AuthUser> {
  const token = await getAccessToken();
  if (!token) throw authenticationError("Anda harus login untuk mengakses resource ini.");

  let payload: AccessTokenPayload;
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET belum diatur");
    payload = await verifyAccessToken(token, secret);
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "AUTHENTICATION_ERROR") throw err;
    throw authenticationError("Sesi tidak valid atau telah berakhir. Silakan login kembali.");
  }

  const userId = Number(payload.sub);
  if (!Number.isFinite(userId)) throw authenticationError("Token tidak valid.");

  // Verifikasi user masih ada di DB (jaga kalau user dihapus setelah token issued)
  const user = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      roleId: users.roleId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then((r) => r[0]);

  if (!user) throw authenticationError("User tidak ditemukan. Silakan login kembali.");

  const role = await db
    .select({ name: roles.name })
    .from(roles)
    .where(eq(roles.id, user.roleId))
    .limit(1)
    .then((r) => r[0]);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    role: role?.name ?? payload.role,
    tokenPayload: payload,
  };
}

// Guard yang tidak throw tapi return null — untuk halaman yang optional auth
export async function getAuthUserOrNull(): Promise<AuthUser | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}
