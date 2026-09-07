import { asc, count, desc, eq, ilike } from "drizzle-orm";

import { db } from "@/shared/database";
import { permissions } from "@/shared/database/schema";
import { getOffset, normalizePagination } from "@/shared/utils/pagination";

export async function findPermissionById(id: number) {
  return db.select().from(permissions).where(eq(permissions.id, id)).limit(1).then((r) => r[0] ?? null);
}

export async function findPermissionByName(name: string) {
  return db.select().from(permissions).where(eq(permissions.name, name)).limit(1).then((r) => r[0] ?? null);
}

export async function findPermissionList(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "newest" | "oldest" | "name_asc" | "name_desc";
}) {
  const pagination = normalizePagination({ page: params.page, limit: params.limit });
  const offset = getOffset(pagination);

  const where = params.search ? ilike(permissions.name, `%${params.search}%`) : undefined;

  let orderBy;
  switch (params.sortBy) {
    case "oldest":
      orderBy = asc(permissions.createdAt);
      break;
    case "name_asc":
      orderBy = asc(permissions.name);
      break;
    case "name_desc":
      orderBy = desc(permissions.name);
      break;
    case "newest":
    default:
      orderBy = desc(permissions.createdAt);
      break;
  }

  const [data, totalResult] = await Promise.all([
    db.select().from(permissions).where(where).orderBy(orderBy).limit(pagination.limit).offset(offset),
    db.select({ value: count() }).from(permissions).where(where).then((r) => r[0]?.value ?? 0),
  ]);

  const total = Number(totalResult);
  return {
    data,
    pagination: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.max(1, Math.ceil(total / pagination.limit)) },
  };
}

export async function createPermission(data: { name: string; description?: string | null }) {
  const [row] = await db
    .insert(permissions)
    .values({ name: data.name, description: data.description ?? null })
    .returning();
  return row;
}

export async function updatePermission(id: number, data: Partial<{ name: string; description: string | null }>) {
  const [row] = await db
    .update(permissions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(permissions.id, id))
    .returning();
  return row ?? null;
}

export async function deletePermission(id: number) {
  await db.delete(permissions).where(eq(permissions.id, id));
}
