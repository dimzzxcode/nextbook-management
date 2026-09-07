import { headers } from "next/headers";

import { notFoundError } from "@/shared/errors";
import { parseOrThrow } from "@/shared/validation/helpers";
import { createAuthorSchema, updateAuthorSchema } from "@/shared/validation/author";
import { idParamSchema } from "@/shared/validation/query";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { requirePermission } from "@/modules/auth/services/authorization.service";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import * as authorRepo from "../repositories/author.repository";

async function getMeta() {
  try {
    const h = await headers();
    return {
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
      ua: h.get("user-agent"),
    };
  } catch {
    return { ip: null, ua: null };
  }
}

export async function listAuthors(rawQuery: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "author.read");

  const query = (rawQuery ?? {}) as { page?: unknown; limit?: unknown; search?: string; sortBy?: string };
  // Reuse generic pagination + search validation via manual parse to avoid over-strict
  const result = await authorRepo.findAuthorList({
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    search: query.search,
    sortBy: query.sortBy as any,
  });
  return result;
}

export async function getAuthorDetail(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "author.read");
  const { id } = parseOrThrow(idParamSchema, { id: rawId });
  const row = await authorRepo.findAuthorById(id);
  if (!row) throw notFoundError("Author tidak ditemukan.");
  return row;
}

export async function createAuthor(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "author.create");
  const input = parseOrThrow(createAuthorSchema, rawInput);
  const created = await authorRepo.createAuthor({
    name: input.name,
    biography: input.biography || null,
  });
  const meta = await getMeta();
  await logAuditEvent({
    userId: user.id,
    action: "AUTHOR_CREATED",
    resource: "author",
    resourceId: String(created.id),
    metadata: { name: created.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });
  return created;
}

export async function updateAuthor(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "author.update");
  const input = parseOrThrow(updateAuthorSchema, rawInput);
  const existing = await authorRepo.findAuthorById(input.id);
  if (!existing) throw notFoundError("Author tidak ditemukan.");
  const updated = await authorRepo.updateAuthor(input.id, {
    name: input.name,
    biography: input.biography,
  });
  if (!updated) throw notFoundError("Gagal update author.");
  const meta = await getMeta();
  await logAuditEvent({
    userId: user.id,
    action: "AUTHOR_UPDATED",
    resource: "author",
    resourceId: String(updated.id),
    metadata: { name: updated.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });
  return updated;
}

export async function deleteAuthor(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "author.delete");
  const { id } = parseOrThrow(idParamSchema, { id: rawId });
  const existing = await authorRepo.findAuthorById(id);
  if (!existing) throw notFoundError("Author tidak ditemukan.");
  await authorRepo.deleteAuthor(id);
  const meta = await getMeta();
  await logAuditEvent({
    userId: user.id,
    action: "AUTHOR_DELETED",
    resource: "author",
    resourceId: String(id),
    metadata: { name: existing.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });
  return { id };
}
