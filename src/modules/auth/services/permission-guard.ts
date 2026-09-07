import type { PermissionName } from "@/shared/constants/permissions";
import { requireAuth, type AuthUser } from "./require-auth";
import { requirePermission } from "./authorization.service";

/**
 * Guard reusable untuk Server Action / Route Handler:
 * 1. requireAuth()
 * 2. requirePermission()
 * Flow: Validate -> Authenticate -> Authorize -> Business Logic
 */
export async function requirePermissionGuard(
  permission: PermissionName
): Promise<AuthUser> {
  const user = await requireAuth();
  await requirePermission(user, permission);
  return user;
}

// Contoh mapping permission ke fitur (untuk dokumentasi)
export const PermissionMap = {
  createBook: "book.create" as const,
  readBook: "book.read" as const,
  updateBook: "book.update" as const,
  deleteBook: "book.delete" as const,
  createAuthor: "author.create" as const,
  readAuthor: "author.read" as const,
  updateAuthor: "author.update" as const,
  deleteAuthor: "author.delete" as const,
  createCategory: "category.create" as const,
  readCategory: "category.read" as const,
  updateCategory: "category.update" as const,
  deleteCategory: "category.delete" as const,
  readUser: "user.read" as const,
  manageUser: "user.manage" as const,
  manageRole: "role.manage" as const,
  managePermission: "permission.manage" as const,
  readAudit: "audit.read" as const,
};
