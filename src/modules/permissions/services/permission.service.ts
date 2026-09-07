import { z } from "zod";
import { getAuditMeta } from "@/shared/utils/audit-meta";

import { conflictError, notFoundError } from "@/shared/errors";
import { parseOrThrow } from "@/shared/validation/helpers";
import { idParamSchema } from "@/shared/validation/query";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { requirePermission } from "@/modules/auth/services/authorization.service";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import * as permRepo from "../repositories/permission.repository";

const createPermissionSchema = z.object({
  name: z.string().trim().min(1).max(100).regex(/^[a-z._]+$/, "Format permission: huruf kecil, titik, underscore."),
  description: z.string().trim().max(255).optional().or(z.literal("")),
});

const updatePermissionSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1).max(100).regex(/^[a-z._]+$/).optional(),
  description: z.string().trim().max(255).optional().or(z.literal("")),
});

export async function listPermissions(rawQuery: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "permission.manage");
  const query = (rawQuery ?? {}) as { page?: unknown; limit?: unknown; search?: string; sortBy?: string };
  return permRepo.findPermissionList({
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    search: query.search,
    sortBy: query.sortBy as "newest" | "oldest" | "name_asc" | "name_desc" | undefined,
  });
}

export async function getPermissionDetail(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "permission.manage");
  const { id } = parseOrThrow(idParamSchema, { id: rawId });
  const perm = await permRepo.findPermissionById(id);
  if (!perm) throw notFoundError("Permission tidak ditemukan.");
  return perm;
}

export async function createPermission(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "permission.manage");
  const input = parseOrThrow(createPermissionSchema, rawInput);
  const existing = await permRepo.findPermissionByName(input.name);
  if (existing) throw conflictError("Nama permission sudah terdaftar.");
  const created = await permRepo.createPermission({ name: input.name, description: input.description || null });
  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "PERMISSION_CREATED",
    resource: "permission",
    resourceId: String(created.id),
    metadata: { name: created.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });
  return created;
}

export async function updatePermission(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "permission.manage");
  const input = parseOrThrow(updatePermissionSchema, rawInput);
  const existing = await permRepo.findPermissionById(input.id);
  if (!existing) throw notFoundError("Permission tidak ditemukan.");
  if (input.name && input.name !== existing.name) {
    const dup = await permRepo.findPermissionByName(input.name);
    if (dup && dup.id !== input.id) throw conflictError("Nama permission sudah terdaftar.");
  }
  const updated = await permRepo.updatePermission(input.id, { name: input.name, description: input.description });
  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "PERMISSION_UPDATED",
    resource: "permission",
    resourceId: String(updated!.id),
    metadata: { name: updated!.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });
  return updated;
}
