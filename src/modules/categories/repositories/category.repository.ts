import { asc, count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/shared/database";
import { categories } from "@/shared/database/schema";
import { getOffset, normalizePagination } from "@/shared/utils/pagination";

export async function createCategory(data: { name: string; description?: string | null }) {
  const [row] = await db
    .insert(categories)
    .values({ name: data.name, description: data.description ?? null })
    .returning();
  return row;
}

export async function findCategoryById(id: number) {
  return db.select().from(categories).where(eq(categories.id, id)).limit(1).then((r) => r[0] ?? null);
}

export async function findCategoryByName(name: string) {
  return db.select().from(categories).where(eq(categories.name, name)).limit(1).then((r) => r[0] ?? null);
}

export async function findCategoryList(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "newest" | "oldest" | "name_asc" | "name_desc";
}) {
  const pagination = normalizePagination({ page: params.page, limit: params.limit });
  const offset = getOffset(pagination);

  const where = params.search
    ? or(ilike(categories.name, `%${params.search}%`), ilike(categories.description, `%${params.search}%`))
    : undefined;

  let orderBy;
  switch (params.sortBy) {
    case "oldest":
      orderBy = asc(categories.createdAt);
      break;
    case "name_asc":
      orderBy = asc(categories.name);
      break;
    case "name_desc":
      orderBy = desc(categories.name);
      break;
    case "newest":
    default:
      orderBy = desc(categories.createdAt);
      break;
  }

  const [data, totalResult] = await Promise.all([
    db.select().from(categories).where(where).orderBy(orderBy).limit(pagination.limit).offset(offset),
    db.select({ value: count() }).from(categories).where(where).then((r) => r[0]?.value ?? 0),
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

export async function updateCategory(
  id: number,
  data: Partial<{ name: string; description: string | null }>
) {
  const [row] = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return row ?? null;
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
}
