import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "@/shared/database";
import { roles, users } from "@/shared/database/schema";
import { getOffset, normalizePagination } from "@/shared/utils/pagination";

export async function findUserById(id: number) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
}

export async function findUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).limit(1).then((r) => r[0] ?? null);
}

export async function findUserList(params: {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  roleName?: string;
  sortBy?: "newest" | "oldest" | "name_asc" | "email_asc";
}) {
  const pagination = normalizePagination({ page: params.page, limit: params.limit });
  const offset = getOffset(pagination);

  const conditions: (SQL | undefined)[] = [];

  if (params.search) {
    const term = `%${params.search}%`;
    conditions.push(or(ilike(users.name, term), ilike(users.email, term)));
  }

  if (params.roleId) conditions.push(eq(users.roleId, params.roleId));

  if (params.roleName) {
    // Filter by role name via join
    conditions.push(eq(roles.name, params.roleName));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (params.sortBy) {
    case "oldest":
      orderBy = asc(users.createdAt);
      break;
    case "name_asc":
      orderBy = asc(users.name);
      break;
    case "email_asc":
      orderBy = asc(users.email);
      break;
    case "newest":
    default:
      orderBy = desc(users.createdAt);
      break;
  }

  const [data, totalResult] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        roleName: roles.name,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(where)
      .orderBy(orderBy)
      .limit(pagination.limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
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

export async function updateUserRole(userId: number, roleId: number) {
  const [row] = await db
    .update(users)
    .set({ roleId, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id, roleId: users.roleId });
  return row ?? null;
}

export async function countAdmins(): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(roles.name, "ADMIN"))
    .then((r) => r[0]?.value ?? 0);
  return Number(result);
}

export async function findRoleById(id: number) {
  return db.select().from(roles).where(eq(roles.id, id)).limit(1).then((r) => r[0] ?? null);
}

export async function findRoleByName(name: string) {
  return db.select().from(roles).where(eq(roles.name, name)).limit(1).then((r) => r[0] ?? null);
}
