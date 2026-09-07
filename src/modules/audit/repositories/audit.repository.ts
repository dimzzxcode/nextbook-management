import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm";

import { db } from "@/shared/database";
import { auditLogs, users } from "@/shared/database/schema";
import { getOffset, normalizePagination } from "@/shared/utils/pagination";

export type AuditListParams = {
  page?: number;
  limit?: number;
  action?: string;
  userId?: number;
  resource?: string;
  search?: string;
  sortBy?: "newest" | "oldest";
};

export async function findAuditLogs(params: AuditListParams) {
  const pagination = normalizePagination({ page: params.page, limit: params.limit });
  const offset = getOffset(pagination);

  const conditions: (SQL | undefined)[] = [];

  if (params.action) conditions.push(eq(auditLogs.action, params.action));
  if (params.userId) conditions.push(eq(auditLogs.userId, params.userId));
  if (params.resource) conditions.push(eq(auditLogs.resource, params.resource));
  if (params.search) {
    const term = `%${params.search}%`;
    conditions.push(ilike(auditLogs.action, term));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy = params.sortBy === "oldest" ? asc(auditLogs.createdAt) : desc(auditLogs.createdAt);

  const [data, totalResult] = await Promise.all([
    db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userName: users.name,
        userEmail: users.email,
        action: auditLogs.action,
        resource: auditLogs.resource,
        resourceId: auditLogs.resourceId,
        metadata: auditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(where)
      .orderBy(orderBy)
      .limit(pagination.limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(auditLogs)
      .where(where)
      .then((r) => r[0]?.value ?? 0),
  ]);

  const total = Number(totalResult);
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    },
  };
}

export async function findAuditById(id: number) {
  return db.select().from(auditLogs).where(eq(auditLogs.id, id)).limit(1).then((r) => r[0] ?? null);
}
