import { pgTable, bigint, varchar, text, timestamp, index } from "drizzle-orm/pg-core";

export const authors = pgTable(
  "authors",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 150 }).notNull(),
    biography: text("biography"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("authors_name_idx").on(table.name)]
);

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
