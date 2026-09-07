import { pgTable, bigint, primaryKey } from "drizzle-orm/pg-core";

import { permissions } from "./permissions";
import { roles } from "./roles";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: bigint("permission_id", { mode: "number" })
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]
);

export type RolePermission = typeof rolePermissions.$inferSelect;
