import { and, eq } from "drizzle-orm";

import { db } from "@/shared/database";
import { permissions, rolePermissions, users } from "@/shared/database/schema";
import { authorizationError } from "@/shared/errors";
import type { PermissionName } from "@/shared/constants/permissions";

import type { AuthUser } from "./require-auth";

export async function getUserPermissions(userId: number): Promise<Set<PermissionName>> {
  const rows = await db
    .select({ name: permissions.name })
    .from(permissions)
    .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(users, eq(users.roleId, rolePermissions.roleId))
    .where(eq(users.id, userId));

  return new Set(rows.map((r) => r.name as PermissionName));
}

export async function hasPermission(
  userId: number,
  permission: PermissionName
): Promise<boolean> {
  const perms = await getUserPermissions(userId);
  return perms.has(permission);
}

// Reusable helper sesuai PRD: can(user, "book.create")
export async function can(
  user: AuthUser | { id: number },
  permission: PermissionName
): Promise<boolean> {
  return hasPermission(user.id, permission);
}

export async function requirePermission(
  user: AuthUser | { id: number },
  permission: PermissionName,
  message?: string
): Promise<void> {
  const allowed = await can(user, permission);
  if (!allowed) {
    throw authorizationError(
      message ?? `Anda tidak memiliki izin: ${permission}`
    );
  }
}

// Untuk pengecekan cepat tanpa DB (hanya untuk UI, bukan security)
// Server tetap harus pakai can() di atas
export function canSync(
  permissions: Set<PermissionName>,
  permission: PermissionName
): boolean {
  return permissions.has(permission);
}
