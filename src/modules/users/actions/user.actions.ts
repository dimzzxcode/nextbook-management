"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import * as userService from "../services/user.service";

export async function listUsersAction(query: unknown) {
  try {
    const result = await userService.listUsers(query);
    return success(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function getUserDetailAction(id: unknown) {
  try {
    const data = await userService.getUserDetail(id);
    return success(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function updateUserRoleAction(input: unknown) {
  try {
    const data = await userService.updateUserRole(input);
    return success(data, "Role user berhasil diperbarui.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
