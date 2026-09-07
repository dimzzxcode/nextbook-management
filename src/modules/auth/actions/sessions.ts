"use server";

import { headers } from "next/headers";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import { sha256 } from "@/shared/utils/hash";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import { getRefreshToken } from "../services/cookie.service";
import { getCurrentUserId } from "../services/current-user.service";
import {
  getActiveSessions,
  revokeAllUserSessions,
  revokeSession,
} from "../services/session.service";
import { parseOrThrow } from "@/shared/validation/helpers";
import { idParamSchema } from "@/shared/validation/query";

export async function getActiveSessionsAction() {
  try {
    const userId = await getCurrentUserId();
    const sessions = await getActiveSessions(userId);

    const currentHash = (await getRefreshToken())
      ? sha256((await getRefreshToken())!)
      : null;

    // Tandai current session jika hash cocok — perlu lookup token_hash
    // Untuk sederhana, bandingkan via service tidak expose hash, jadi ambil semua lalu cek
    // Kita ambil raw sessions untuk current check
    const { db } = await import("@/shared/database");
    const { sessions: sessionsTable } = await import("@/shared/database/schema");
    const { eq } = await import("drizzle-orm");
    let currentId: number | null = null;
    if (currentHash) {
      const cur = await db
        .select({ id: sessionsTable.id })
        .from(sessionsTable)
        .where(eq(sessionsTable.tokenHash, currentHash))
        .limit(1)
        .then((r) => r[0]);
      currentId = cur?.id ?? null;
    }

    const data = sessions.map((s) => ({
      ...s,
      isCurrent: currentId !== null && s.id === currentId,
    }));

    return success(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function revokeSessionAction(rawSessionId: unknown) {
  try {
    const userId = await getCurrentUserId();
    const { id } = parseOrThrow(idParamSchema, { id: rawSessionId });

    await revokeSession(id, userId);

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = h.get("user-agent");

    await logAuditEvent({
      userId,
      action: "SESSION_REVOKED",
      resource: "session",
      resourceId: String(id),
      ipAddress: ip,
      userAgent: ua,
    });

    return success(null, "Session berhasil dicabut.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function revokeAllSessionsAction() {
  try {
    const userId = await getCurrentUserId();
    await revokeAllUserSessions(userId);

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = h.get("user-agent");

    await logAuditEvent({
      userId,
      action: "SESSION_REVOKED",
      resource: "session",
      resourceId: "all",
      ipAddress: ip,
      userAgent: ua,
    });

    // Clear cookies — user will be logged out dari current device juga
    const { clearAuthCookies } = await import("../services/cookie.service");
    await clearAuthCookies();

    return success(null, "Semua session berhasil dicabut.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
