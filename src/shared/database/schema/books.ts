import {
  pgTable,
  bigint,
  varchar,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { authors } from "./authors";
import { categories } from "./categories";

export const books = pgTable(
  "books",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    title: varchar("title", { length: 255 }).notNull(),
    isbn: varchar("isbn", { length: 20 }),
    description: text("description"),
    publishedYear: integer("published_year"),
    authorId: bigint("author_id", { mode: "number" }).references(
      () => authors.id,
      { onDelete: "restrict" }
    ),
    categoryId: bigint("category_id", { mode: "number" }).references(
      () => categories.id,
      { onDelete: "restrict" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("books_isbn_unique").on(table.isbn),
    index("books_title_idx").on(table.title),
    index("books_isbn_idx").on(table.isbn),
    index("books_author_id_idx").on(table.authorId),
    index("books_category_id_idx").on(table.categoryId),
    index("books_published_year_idx").on(table.publishedYear),
    index("books_deleted_at_idx").on(table.deletedAt),
  ]
);

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
