export const PERMISSIONS = {
  BOOK_CREATE: "book.create",
  BOOK_READ: "book.read",
  BOOK_UPDATE: "book.update",
  BOOK_DELETE: "book.delete",

  AUTHOR_CREATE: "author.create",
  AUTHOR_READ: "author.read",
  AUTHOR_UPDATE: "author.update",
  AUTHOR_DELETE: "author.delete",

  CATEGORY_CREATE: "category.create",
  CATEGORY_READ: "category.read",
  CATEGORY_UPDATE: "category.update",
  CATEGORY_DELETE: "category.delete",

  USER_READ: "user.read",
  USER_MANAGE: "user.manage",

  ROLE_MANAGE: "role.manage",
  PERMISSION_MANAGE: "permission.manage",

  AUDIT_READ: "audit.read",
} as const;

export type PermissionName =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionName[] = Object.values(PERMISSIONS);
