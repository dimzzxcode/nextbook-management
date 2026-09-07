import { asc, count, desc, eq, ilike } from "drizzle-orm";

import { db } from "@/shared/database";
import { permissions, rolePermissions, roles } from "@/shared/database/schema";
import { getOffset, normalizePagination } from "@/shared/utils/pagination";

export async function findRoleById(id: number) {
  return db.select().from(roles).where(eq(roles.id, id)).limit(1).then((r) => r[0] ?? null);
}

export async function findRoleByName(name: string) {
  return db.select().from(roles).where(eq(roles.name, name)).limit(1).then((r) => r[0] ?? null);
}

export async function findRoleList(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "newest" | "oldest" | "name_asc" | "name_desc";
}) {
  const pagination = normalizePagination({ page: params.page, limit: params.limit });
  const offset = getOffset(pagination);

  const where = params.search ? ilike(roles.name, `%${params.search}%`) : undefined;

  let orderBy;
  switch (params.sortBy) {
    case "oldest":
      orderBy = asc(roles.createdAt);
      break;
    case "name_asc":
      orderBy = asc(roles.name);
      break;
    case "name_desc":
      orderBy = desc(roles.name);
      break;
    case "newest":
    default:
      orderBy = desc(roles.createdAt);
      break;
  }

  const [data, totalResult] = await Promise.all([
    db.select().from(roles).where(where).orderBy(orderBy).limit(pagination.limit).offset(offset),
    db.select({ value: count() }).from(roles).where(where).then((r) => r[0]?.value ?? 0),
  ]);

  const total = Number(totalResult);
  return {
    data,
    pagination: { page: pagination.page, limit: pagination.limit, total, totalPages: Math.max(1, Math.ceil(total / pagination.limit)) },
  };
}

export async function createRole(data: { name: string; description?: string | null }) {
  const [row] = await db
    .insert(roles)
    .values({ name: data.name, description: data.description ?? null })
    .returning();
  return row;
}

export async function updateRole(id: number, data: Partial<{ name: string; description: string | null }>) {
  const [row] = await db
    .update(roles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(roles.id, id))
    .returning();
  return row ?? null;
}

export async function deleteRole(id: number) {
  await db.delete(roles).where(eq(roles.id, id));
}

export async function getRolePermissions(roleId: number) {
  return db
    .select({ id: permissions.id, name: permissions.name, description: permissions.description })
    .from(permissions)
    .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId));
}

export async function assignPermissionsToRole(roleId: number, permissionIds: number[]) {
  // Replace all: delete then insert
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  if (permissionIds.length > 0) {
    await db.insert(rolePermissions).values(permissionIds.map((pid) => ({ roleId, permissionId: pid })));
  }
}
