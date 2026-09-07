"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import { checkRateLimit, getClientIp } from "@/shared/ratelimit";
import { requestPasswordReset, resetPassword } from "../services/password-reset.service";

export async function forgotPasswordAction(input: unknown) {
  try {
    const ip = await getClientIp();
    await checkRateLimit("forgot", ip);
    const result = await requestPasswordReset(input);
    // Selalu generic
    return success(result, result.message);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function resetPasswordAction(input: unknown) {
  try {
    const ip = await getClientIp();
    await checkRateLimit("reset", ip);
    const result = await resetPassword(input);
    return success(result, result.message);
  } catch (err) {
    return toErrorResponse(err);
  }
}
