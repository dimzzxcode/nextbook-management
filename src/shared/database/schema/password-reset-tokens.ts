import { pgTable, bigint, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("prt_user_id_idx").on(table.userId),
    index("prt_token_hash_idx").on(table.tokenHash),
    index("prt_expires_at_idx").on(table.expiresAt),
  ]
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
