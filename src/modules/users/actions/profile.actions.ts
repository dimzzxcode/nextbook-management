"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import * as profileService from "../services/profile.service";

export async function getOwnProfileAction() {
  try {
    const data = await profileService.getOwnProfile();
    return success(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function updateOwnProfileAction(input: unknown) {
  try {
    const data = await profileService.updateOwnProfile(input);
    return success(data, "Profile berhasil diperbarui.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
