"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
} from "../services/cookie.service";
import { verifyAccessToken } from "../services/jwt.service";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import { db } from "@/shared/database";
import { sessions } from "@/shared/database/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { sha256 } from "@/shared/utils/hash";

export async function logoutAction() {
  try {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    let userId: number | null = null;

    if (refreshToken) {
      try {
        const hash = sha256(refreshToken);
        const session = await db
          .select({ userId: sessions.userId })
          .from(sessions)
          .where(eq(sessions.tokenHash, hash))
          .limit(1)
          .then((r) => r[0]);

        if (session) {
          userId = session.userId;
          await db.delete(sessions).where(eq(sessions.tokenHash, hash));
        }
      } catch {
        // ignore
      }
    }

    if (!userId && accessToken) {
      try {
        const secret = process.env.JWT_SECRET!;
        const payload = await verifyAccessToken(accessToken, secret);
        userId = Number(payload.sub);
      } catch {
        // ignore
      }
    }

    await clearAuthCookies();

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    if (userId) {
      await logAuditEvent({
        userId,
        action: "USER_LOGOUT",
        resource: "user",
        resourceId: String(userId),
        ipAddress: ip,
      });
    }

    return success(null, "Logout berhasil.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
