import { z } from "zod";

import { parseOrThrow } from "@/shared/validation/helpers";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { requirePermission } from "@/modules/auth/services/authorization.service";
import * as auditRepo from "../repositories/audit.repository";

const auditListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  action: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  userId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  resource: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  search: z.string().trim().max(100).optional().or(z.literal("")),
  sortBy: z.enum(["newest", "oldest"]).default("newest").optional(),
});

export async function listAuditLogs(rawQuery: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "audit.read");

  const query = parseOrThrow(auditListQuerySchema, rawQuery ?? {});
  const result = await auditRepo.findAuditLogs(query);
  return result;
}

export async function getAuditDetail(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "audit.read");
  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) throw new Error("ID tidak valid.");
  const row = await auditRepo.findAuditById(id);
  if (!row) throw new Error("Audit log tidak ditemukan.");
  return row;
}
