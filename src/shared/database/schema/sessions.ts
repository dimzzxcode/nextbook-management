import {
  pgTable,
  bigint,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    userAgent: varchar("user_agent", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_token_hash_idx").on(table.tokenHash),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ]
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
