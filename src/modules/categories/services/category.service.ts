import { conflictError, notFoundError } from "@/shared/errors";
import { getAuditMeta } from "@/shared/utils/audit-meta";
import { parseOrThrow } from "@/shared/validation/helpers";
import { createCategorySchema, updateCategorySchema } from "@/shared/validation/category";
import { idParamSchema } from "@/shared/validation/query";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { requirePermission } from "@/modules/auth/services/authorization.service";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import * as categoryRepo from "../repositories/category.repository";

export async function listCategories(rawQuery: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "category.read");
  const query = (rawQuery ?? {}) as { page?: unknown; limit?: unknown; search?: string; sortBy?: string };
  return categoryRepo.findCategoryList({
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    search: query.search,
    sortBy: query.sortBy as "newest" | "oldest" | "name_asc" | "name_desc" | undefined,
  });
}

export async function getCategoryDetail(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "category.read");
  const { id } = parseOrThrow(idParamSchema, { id: rawId });
  const row = await categoryRepo.findCategoryById(id);
  if (!row) throw notFoundError("Kategori tidak ditemukan.");
  return row;
}

export async function createCategory(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "category.create");
  const input = parseOrThrow(createCategorySchema, rawInput);

  const existing = await categoryRepo.findCategoryByName(input.name);
  if (existing) throw conflictError("Nama kategori sudah terdaftar.");

  const created = await categoryRepo.createCategory({
    name: input.name,
    description: input.description || null,
  });

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "CATEGORY_CREATED",
    resource: "category",
    resourceId: String(created.id),
    metadata: { name: created.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return created;
}

export async function updateCategory(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "category.update");
  const input = parseOrThrow(updateCategorySchema, rawInput);

  const existing = await categoryRepo.findCategoryById(input.id);
  if (!existing) throw notFoundError("Kategori tidak ditemukan.");

  if (input.name && input.name !== existing.name) {
    const dup = await categoryRepo.findCategoryByName(input.name);
    if (dup && dup.id !== input.id) throw conflictError("Nama kategori sudah terdaftar.");
  }

  const updated = await categoryRepo.updateCategory(input.id, {
    name: input.name,
    description: input.description,
  });
  if (!updated) throw notFoundError("Gagal update kategori.");

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "CATEGORY_UPDATED",
    resource: "category",
    resourceId: String(updated.id),
    metadata: { name: updated.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return updated;
}

export async function deleteCategory(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "category.delete");
  const { id } = parseOrThrow(idParamSchema, { id: rawId });
  const existing = await categoryRepo.findCategoryById(id);
  if (!existing) throw notFoundError("Kategori tidak ditemukan.");
  await categoryRepo.deleteCategory(id);
  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "CATEGORY_DELETED",
    resource: "category",
    resourceId: String(id),
    metadata: { name: existing.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });
  return { id };
}
