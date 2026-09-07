"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import * as roleService from "../services/role.service";

export async function listRolesAction(query: unknown) {
  try {
    const result = await roleService.listRoles(query);
    return success(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function getRoleDetailAction(id: unknown) {
  try {
    const data = await roleService.getRoleDetail(id);
    return success(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function createRoleAction(input: unknown) {
  try {
    const data = await roleService.createRole(input);
    return success(data, "Role berhasil dibuat.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function updateRoleAction(input: unknown) {
  try {
    const data = await roleService.updateRole(input);
    return success(data, "Role berhasil diperbarui.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function assignRolePermissionsAction(input: unknown) {
  try {
    const data = await roleService.assignRolePermissions(input);
    return success(data, "Permission role berhasil diperbarui.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
