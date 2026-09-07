import { z } from "zod";
import { getAuditMeta } from "@/shared/utils/audit-meta";

import { conflictError, notFoundError } from "@/shared/errors";
import { parseOrThrow } from "@/shared/validation/helpers";
import { idParamSchema } from "@/shared/validation/query";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { requirePermission } from "@/modules/auth/services/authorization.service";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import * as roleRepo from "../repositories/role.repository";
import { db } from "@/shared/database";
import { permissions } from "@/shared/database/schema";
import { inArray } from "drizzle-orm";

const createRoleSchema = z.object({
  name: z.string().trim().min(1, "Nama role wajib diisi.").max(50, "Maks 50 karakter.").regex(/^[A-Z_]+$/, "Nama role huruf besar, underscore, tanpa spasi."),
  description: z.string().trim().max(255).optional().or(z.literal("")),
});

const updateRoleSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(50).regex(/^[A-Z_]+$/).optional(),
  description: z.string().trim().max(255).optional().or(z.literal("")),
});

const assignPermissionsSchema = z.object({
  roleId: z.coerce.number().int().positive(),
  permissionIds: z.array(z.coerce.number().int().positive()).min(1, "Minimal satu permission.").max(50),
});

export async function listRoles(rawQuery: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "role.manage");
  const query = (rawQuery ?? {}) as { page?: unknown; limit?: unknown; search?: string; sortBy?: string };
  return roleRepo.findRoleList({
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    search: query.search,
    sortBy: query.sortBy as "newest" | "oldest" | "name_asc" | "name_desc" | undefined,
  });
}

export async function getRoleDetail(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "role.manage");
  const { id } = parseOrThrow(idParamSchema, { id: rawId });
  const role = await roleRepo.findRoleById(id);
  if (!role) throw notFoundError("Role tidak ditemukan.");
  const perms = await roleRepo.getRolePermissions(id);
  return { ...role, permissions: perms };
}

export async function createRole(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "role.manage");
  const input = parseOrThrow(createRoleSchema, rawInput);
  const existing = await roleRepo.findRoleByName(input.name);
  if (existing) throw conflictError("Nama role sudah terdaftar.");

  const created = await roleRepo.createRole({ name: input.name, description: input.description || null });
  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "ROLE_CREATED",
    resource: "role",
    resourceId: String(created.id),
    metadata: { name: created.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });
  return created;
}

export async function updateRole(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "role.manage");
  const input = parseOrThrow(updateRoleSchema, rawInput);
  const existing = await roleRepo.findRoleById(input.id);
  if (!existing) throw notFoundError("Role tidak ditemukan.");
  if (input.name && input.name !== existing.name) {
    const dup = await roleRepo.findRoleByName(input.name);
    if (dup && dup.id !== input.id) throw conflictError("Nama role sudah terdaftar.");
  }
  const updated = await roleRepo.updateRole(input.id, {
    name: input.name,
    description: input.description,
  });
  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "ROLE_UPDATED",
    resource: "role",
    resourceId: String(updated!.id),
    metadata: { name: updated!.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });
  return updated;
}

export async function assignRolePermissions(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "permission.manage");
  const input = parseOrThrow(assignPermissionsSchema, rawInput);

  const role = await roleRepo.findRoleById(input.roleId);
  if (!role) throw notFoundError("Role tidak ditemukan.");

  // Validasi permissionIds exist
  const perms = await db.select({ id: permissions.id }).from(permissions).where(inArray(permissions.id, input.permissionIds));
  if (perms.length !== input.permissionIds.length) {
    throw notFoundError("Beberapa permission tidak ditemukan.");
  }

  await roleRepo.assignPermissionsToRole(input.roleId, input.permissionIds);

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "ROLE_PERMISSIONS_CHANGED",
    resource: "role",
    resourceId: String(role.id),
    metadata: { permissionIds: input.permissionIds },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  const updatedPerms = await roleRepo.getRolePermissions(input.roleId);
  return { roleId: input.roleId, permissions: updatedPerms };
}
