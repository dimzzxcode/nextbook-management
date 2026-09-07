import { authenticationError } from "@/shared/errors";
import { getAccessToken } from "./cookie.service";
import { verifyAccessToken } from "./jwt.service";

export async function getCurrentUserId(): Promise<number> {
  const token = await getAccessToken();
  if (!token) throw authenticationError("Anda harus login.");

  try {
    const secret = process.env.JWT_SECRET!;
    const payload = await verifyAccessToken(token, secret);
    const userId = Number(payload.sub);
    if (!Number.isFinite(userId)) throw authenticationError("Token tidak valid.");
    return userId;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "AUTHENTICATION_ERROR") throw err;
    throw authenticationError("Sesi tidak valid atau telah berakhir. Silakan login kembali.");
  }
}

export async function getCurrentUserPayload() {
  const token = await getAccessToken();
  if (!token) throw authenticationError("Anda harus login.");
  const secret = process.env.JWT_SECRET!;
  return verifyAccessToken(token, secret);
}
