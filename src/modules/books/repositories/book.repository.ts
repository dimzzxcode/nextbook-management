import { and, asc, desc, eq, ilike, isNull, isNotNull, or, count, type SQL } from "drizzle-orm";

import { db } from "@/shared/database";
import { authors, books, categories } from "@/shared/database/schema";
import type { BookListQuery } from "@/shared/validation/query";
import { getOffset, normalizePagination } from "@/shared/utils/pagination";

export type BookListParams = BookListQuery;

export async function createBook(data: {
  title: string;
  isbn?: string | null;
  description?: string | null;
  publishedYear?: number | null;
  authorId?: number | null;
  categoryId?: number | null;
}) {
  const [row] = await db
    .insert(books)
    .values({
      title: data.title,
      isbn: data.isbn ?? null,
      description: data.description ?? null,
      publishedYear: data.publishedYear ?? null,
      authorId: data.authorId ?? null,
      categoryId: data.categoryId ?? null,
    })
    .returning();
  return row;
}

export async function findBookById(id: number, options?: { includeDeleted?: boolean }) {
  const where = options?.includeDeleted
    ? eq(books.id, id)
    : and(eq(books.id, id), isNull(books.deletedAt));

  const row = await db
    .select({
      book: books,
      author: { id: authors.id, name: authors.name },
      category: { id: categories.id, name: categories.name },
    })
    .from(books)
    .leftJoin(authors, eq(books.authorId, authors.id))
    .leftJoin(categories, eq(books.categoryId, categories.id))
    .where(where)
    .limit(1)
    .then((r) => r[0] ?? null);

  return row;
}

export async function findBookList(params: BookListParams) {
  const pagination = normalizePagination({ page: params.page, limit: params.limit });
  const offset = getOffset(pagination);

  const conditions: (SQL | undefined)[] = [];

  // Status filter
  if (params.status === "available") {
    conditions.push(isNull(books.deletedAt));
  } else if (params.status === "deleted") {
    conditions.push(isNotNull(books.deletedAt));
  }
  // "all" → no filter

  if (params.authorId) conditions.push(eq(books.authorId, params.authorId));
  if (params.categoryId) conditions.push(eq(books.categoryId, params.categoryId));
  if (params.publishedYear) conditions.push(eq(books.publishedYear, params.publishedYear));

  if (params.search) {
    const term = `%${params.search}%`;
    // Search title, isbn, author name
    conditions.push(
      or(
        ilike(books.title, term),
        ilike(books.isbn, term),
        ilike(authors.name, term)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Sorting
  let orderBy;
  switch (params.sortBy) {
    case "oldest":
      orderBy = asc(books.createdAt);
      break;
    case "title_asc":
      orderBy = asc(books.title);
      break;
    case "title_desc":
      orderBy = desc(books.title);
      break;
    case "newest":
    default:
      orderBy = desc(books.createdAt);
      break;
  }

  const [data, totalResult] = await Promise.all([
    db
      .select({
        book: books,
        author: { id: authors.id, name: authors.name },
        category: { id: categories.id, name: categories.name },
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(where)
      .orderBy(orderBy)
      .limit(pagination.limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
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

export async function updateBook(
  id: number,
  data: Partial<{
    title: string;
    isbn: string | null;
    description: string | null;
    publishedYear: number | null;
    authorId: number | null;
    categoryId: number | null;
  }>
) {
  const [row] = await db
    .update(books)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(books.id, id))
    .returning();
  return row ?? null;
}

export async function softDeleteBook(id: number) {
  const [row] = await db
    .update(books)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(books.id, id), isNull(books.deletedAt)))
    .returning();
  return row ?? null;
}

export async function restoreBook(id: number) {
  const [row] = await db
    .update(books)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(books.id, id), isNotNull(books.deletedAt)))
    .returning();
  return row ?? null;
}

export async function hardDeleteBook(id: number) {
  await db.delete(books).where(eq(books.id, id));
}
