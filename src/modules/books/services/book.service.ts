import { db } from "@/shared/database";
import { books } from "@/shared/database/schema";
import { eq } from "drizzle-orm";
import { getAuditMeta } from "@/shared/utils/audit-meta";
import {
  conflictError,
  notFoundError,
} from "@/shared/errors";
import { parseOrThrow } from "@/shared/validation/helpers";
import {
  createBookSchema,
  updateBookSchema,
} from "@/shared/validation/book";
import {
  bookListQuerySchema,
  idParamSchema,
} from "@/shared/validation/query";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { requirePermission } from "@/modules/auth/services/authorization.service";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import * as bookRepo from "../repositories/book.repository";

export async function listBooks(rawQuery: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "book.read");

  const query = parseOrThrow(bookListQuerySchema, rawQuery ?? {});
  const result = await bookRepo.findBookList(query);
  return result;
}

export async function getBookDetail(rawId: unknown, opts?: { includeDeleted?: boolean }) {
  const user = await requireAuth();
  await requirePermission(user, "book.read");

  const { id } = parseOrThrow(idParamSchema, { id: rawId });
  const row = await bookRepo.findBookById(id, { includeDeleted: opts?.includeDeleted });

  if (!row) throw notFoundError("Buku tidak ditemukan.");

  // Soft-deleted book hanya boleh dilihat jika includeDeleted true (admin/staff)
  // Untuk USER, sudah terfilter di findBookById tanpa includeDeleted
  return row;
}

export async function createBook(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "book.create");

  const input = parseOrThrow(createBookSchema, rawInput);

  // Cek ISBN unik (jika ada)
  if (input.isbn) {
    const existing = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.isbn, input.isbn))
      .limit(1)
      .then((r) => r[0]);
    if (existing) throw conflictError("ISBN sudah terdaftar.");
  }

  const created = await bookRepo.createBook({
    title: input.title,
    isbn: input.isbn ?? null,
    description: input.description || null,
    publishedYear: input.publishedYear ?? null,
    authorId: input.authorId ?? null,
    categoryId: input.categoryId ?? null,
  });

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "BOOK_CREATED",
    resource: "book",
    resourceId: String(created.id),
    metadata: { title: created.title },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return created;
}

export async function updateBook(rawInput: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "book.update");

  const input = parseOrThrow(updateBookSchema, rawInput);

  const existing = await bookRepo.findBookById(input.id, { includeDeleted: true });
  if (!existing) throw notFoundError("Buku tidak ditemukan.");
  if (existing.book.deletedAt) throw notFoundError("Buku telah dihapus.");

  if (input.isbn && input.isbn !== existing.book.isbn) {
    const dup = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.isbn, input.isbn))
      .limit(1)
      .then((r) => r[0]);
    if (dup && dup.id !== input.id) throw conflictError("ISBN sudah terdaftar.");
  }

  const updated = await bookRepo.updateBook(input.id, {
    title: input.title,
    isbn: input.isbn ?? undefined,
    description: input.description ?? undefined,
    publishedYear: input.publishedYear ?? undefined,
    authorId: input.authorId ?? undefined,
    categoryId: input.categoryId ?? undefined,
  });

  if (!updated) throw notFoundError("Gagal update buku.");

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "BOOK_UPDATED",
    resource: "book",
    resourceId: String(updated.id),
    metadata: { title: updated.title },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return updated;
}

export async function deleteBook(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "book.delete");

  const { id } = parseOrThrow(idParamSchema, { id: rawId });

  const deleted = await bookRepo.softDeleteBook(id);
  if (!deleted) {
    const exists = await bookRepo.findBookById(id, { includeDeleted: true });
    if (!exists) throw notFoundError("Buku tidak ditemukan.");
    throw conflictError("Buku sudah dihapus sebelumnya.");
  }

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "BOOK_DELETED",
    resource: "book",
    resourceId: String(id),
    metadata: { title: deleted.title },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return deleted;
}

export async function restoreBook(rawId: unknown) {
  const user = await requireAuth();
  await requirePermission(user, "book.delete"); // restore butuh permission delete/manage

  const { id } = parseOrThrow(idParamSchema, { id: rawId });

  const restored = await bookRepo.restoreBook(id);
  if (!restored) {
    const exists = await bookRepo.findBookById(id, { includeDeleted: true });
    if (!exists) throw notFoundError("Buku tidak ditemukan.");
    throw conflictError("Buku belum dihapus atau sudah dipulihkan.");
  }

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: user.id,
    action: "BOOK_RESTORED",
    resource: "book",
    resourceId: String(id),
    metadata: { title: restored.title },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return restored;
}
