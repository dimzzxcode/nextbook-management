"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import { changePassword } from "../services/password-change.service";

export async function changePasswordAction(input: unknown) {
  try {
    await changePassword(input);
    return success(null, "Kata sandi berhasil diubah.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
