"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import * as permService from "../services/permission.service";

export async function listPermissionsAction(query: unknown) {
  try {
    const result = await permService.listPermissions(query);
    return success(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function getPermissionDetailAction(id: unknown) {
  try {
    const data = await permService.getPermissionDetail(id);
    return success(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function createPermissionAction(input: unknown) {
  try {
    const data = await permService.createPermission(input);
    return success(data, "Permission berhasil dibuat.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function updatePermissionAction(input: unknown) {
  try {
    const data = await permService.updatePermission(input);
    return success(data, "Permission berhasil diperbarui.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
