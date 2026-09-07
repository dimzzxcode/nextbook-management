"use server";

import { headers } from "next/headers";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";

import { loginUser } from "../services/auth.service";
import { setAuthCookies } from "../services/cookie.service";

export async function loginAction(input: unknown) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
    const userAgent = h.get("user-agent");

    const result = await loginUser(input, {
      ipAddress: ip,
      userAgent,
    });

    await setAuthCookies({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return success(
      { user: result.user, sessionId: result.sessionId },
      "Login berhasil."
    );
  } catch (err) {
    return toErrorResponse(err);
  }
}
