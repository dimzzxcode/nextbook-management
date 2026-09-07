import { authorizationError } from "@/shared/errors";
import type { AuthUser } from "./require-auth";

/**
 * Resource-level authorization:
 * Authenticated != Automatically Authorized
 * User tidak boleh akses resource milik user lain hanya dengan ganti ID di URL.
 */

export function requireOwnership(
  currentUser: AuthUser,
  resourceOwnerId: number,
  message = "Anda tidak memiliki akses ke resource ini."
): void {
  if (currentUser.id !== resourceOwnerId) {
    throw authorizationError(message);
  }
}

// Untuk resource yang boleh diakses oleh owner ATAU admin/staff dengan permission tertentu
export async function requireOwnershipOrPermission(
  currentUser: AuthUser,
  resourceOwnerId: number,
  permission: string,
  hasPermission: (userId: number, perm: string) => Promise<boolean>
): Promise<void> {
  if (currentUser.id === resourceOwnerId) return;
  const allowed = await hasPermission(currentUser.id, permission);
  if (!allowed) {
    throw authorizationError("Anda tidak memiliki izin untuk mengakses resource ini.");
  }
}

// Contoh untuk profile & sessions (user-specific)
export function canAccessUserResource(
  currentUser: AuthUser,
  targetUserId: number
): boolean {
  return currentUser.id === targetUserId;
}
