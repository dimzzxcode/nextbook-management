import { z } from "zod";
import { getAuditMeta } from "@/shared/utils/audit-meta";

import { notFoundError, validationError, conflictError, authorizationError } from "@/shared/errors";
import { parseOrThrow } from "@/shared/validation/helpers";
import { idParamSchema } from "@/shared/validation/query";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { requirePermission } from "@/modules/auth/services/authorization.service";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import * as userRepo from "../repositories/user.repository";

const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  search: z.string().trim().max(100).optional().or(z.literal("")),
  roleId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  roleName: z.enum(["ADMIN", "STAFF", "USER"]).optional().or(z.literal("").transform(() => undefined)),
  sortBy: z.enum(["newest", "oldest", "name_asc", "email_asc"]).default("newest").optional(),
});

const updateUserRoleSchema = z.object({
  id: z.coerce.number().int().positive("ID user tidak valid."),
  roleId: z.coerce.number().int().positive("ID role tidak valid."),
});

export async function listUsers(rawQuery: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "user.read");

  const query = parseOrThrow(userListQuerySchema, rawQuery ?? {});
  const result = await userRepo.findUserList(query);
  return result;
}

export async function getUserDetail(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "user.read");
  const { id } = parseOrThrow(idParamSchema, { id: rawId });
  const row = await userRepo.findUserById(id);
  if (!row) throw notFoundError("User tidak ditemukan.");
  return row;
}

export async function updateUserRole(rawInput: unknown) {
  const currentUser = await requireAuth();
  await requirePermission(currentUser, "user.manage");

  const input = parseOrThrow(updateUserRoleSchema, rawInput);

  const targetUser = await userRepo.findUserById(input.id);
  if (!targetUser) throw notFoundError("User tidak ditemukan.");

  const newRole = await userRepo.findRoleById(input.roleId);
  if (!newRole) throw validationError("Role tidak valid.");

  // Protect critical changes
  // 1. Jangan hapus admin terakhir
  if (targetUser.roleName === "ADMIN" && newRole.name !== "ADMIN") {
    const adminCount = await userRepo.countAdmins();
    if (adminCount <= 1) {
      throw conflictError("Tidak dapat mengubah role admin terakhir. Minimal satu admin harus ada.");
    }
  }

  // 2. Jangan izinkan user mengubah role dirinya sendiri (cegah self-demotion / privilege confusion)
  if (currentUser.id === targetUser.id) {
    throw authorizationError("Anda tidak dapat mengubah role akun Anda sendiri.");
  }

  // 3. Privilege escalation: hanya ADMIN yang boleh assign ADMIN (sudah tercover via user.manage, tapi double-check)
  // Staff tidak punya user.manage jadi sudah terblokir; tambahan guard jika suatu saat role.manage berbeda
  if (newRole.name === "ADMIN" && currentUser.role !== "ADMIN") {
    throw authorizationError("Hanya admin yang dapat memberikan role admin.");
  }

  const updated = await userRepo.updateUserRole(input.id, input.roleId);
  if (!updated) throw notFoundError("Gagal update role.");

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: currentUser.id,
    action: "USER_ROLE_CHANGED",
    resource: "user",
    resourceId: String(input.id),
    metadata: { from: targetUser.roleName, to: newRole.name, targetEmail: targetUser.email },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return { id: updated.id, roleId: updated.roleId, roleName: newRole.name };
}
