import { asc, count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/shared/database";
import { authors } from "@/shared/database/schema";
import { getOffset, normalizePagination } from "@/shared/utils/pagination";

export async function createAuthor(data: { name: string; biography?: string | null }) {
  const [row] = await db
    .insert(authors)
    .values({ name: data.name, biography: data.biography ?? null })
    .returning();
  return row;
}

export async function findAuthorById(id: number) {
  return db.select().from(authors).where(eq(authors.id, id)).limit(1).then((r) => r[0] ?? null);
}

export async function findAuthorList(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "newest" | "oldest" | "name_asc" | "name_desc";
}) {
  const pagination = normalizePagination({ page: params.page, limit: params.limit });
  const offset = getOffset(pagination);

  const where = params.search
    ? or(ilike(authors.name, `%${params.search}%`), ilike(authors.biography, `%${params.search}%`))
    : undefined;

  let orderBy;
  switch (params.sortBy) {
    case "oldest":
      orderBy = asc(authors.createdAt);
      break;
    case "name_asc":
      orderBy = asc(authors.name);
      break;
    case "name_desc":
      orderBy = desc(authors.name);
      break;
    case "newest":
    default:
      orderBy = desc(authors.createdAt);
      break;
  }

  const [data, totalResult] = await Promise.all([
    db.select().from(authors).where(where).orderBy(orderBy).limit(pagination.limit).offset(offset),
    db.select({ value: count() }).from(authors).where(where).then((r) => r[0]?.value ?? 0),
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

export async function updateAuthor(
  id: number,
  data: Partial<{ name: string; biography: string | null }>
) {
  const [row] = await db
    .update(authors)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(authors.id, id))
    .returning();
  return row ?? null;
}

export async function deleteAuthor(id: number) {
  await db.delete(authors).where(eq(authors.id, id));
}

export async function findAuthorByName(name: string) {
  return db.select().from(authors).where(eq(authors.name, name)).limit(1).then((r) => r[0] ?? null);
}
