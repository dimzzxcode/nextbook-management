import {
  pgTable,
  bigint,
  varchar,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    userId: bigint("user_id", { mode: "number" }).references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 50 }).notNull(),
    resource: varchar("resource", { length: 50 }),
    resourceId: varchar("resource_id", { length: 50 }),
    metadata: jsonb("metadata"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_resource_idx").on(table.resource),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ]
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
