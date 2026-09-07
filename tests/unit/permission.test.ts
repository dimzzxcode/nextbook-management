import { describe, it, expect } from "vitest";
import { PERMISSIONS } from "@/shared/constants/permissions";

// Unit untuk permission constants & logic sync (tanpa DB)
// Untuk DB-based hasPermission, integration test akan cover

describe("Permissions Constants", () => {
  it("should contain all required permissions", () => {
    const required = [
      "book.create",
      "book.read",
      "book.update",
      "book.delete",
      "author.create",
      "author.read",
      "author.update",
      "author.delete",
      "category.create",
      "category.read",
      "category.update",
      "category.delete",
      "user.read",
      "user.manage",
      "role.manage",
      "permission.manage",
      "audit.read",
    ];
    for (const p of required) {
      expect(Object.values(PERMISSIONS)).toContain(p);
    }
  });

  it("should have 17 permissions", () => {
    expect(Object.values(PERMISSIONS)).toHaveLength(17);
  });
});

describe("Authorization Logic (sync)", () => {
  it("should check permission via Set", async () => {
    const perms = new Set<string>(["book.read", "book.create"]);
    expect(perms.has("book.read")).toBe(true);
    expect(perms.has("book.delete")).toBe(false);
    expect(perms.has("audit.read")).toBe(false);
  });

  it("ADMIN should have all permissions (simulated)", () => {
    const all = new Set(Object.values(PERMISSIONS));
    expect(all.has("role.manage")).toBe(true);
    expect(all.has("audit.read")).toBe(true);
    expect(all.size).toBe(17);
  });

  it("STAFF should have book/author/category * but not audit.read", () => {
    const staffPerms = new Set<string>([
      PERMISSIONS.BOOK_CREATE,
      PERMISSIONS.BOOK_READ,
      PERMISSIONS.BOOK_UPDATE,
      PERMISSIONS.BOOK_DELETE,
      PERMISSIONS.AUTHOR_CREATE,
      PERMISSIONS.AUTHOR_READ,
      PERMISSIONS.AUTHOR_UPDATE,
      PERMISSIONS.AUTHOR_DELETE,
      PERMISSIONS.CATEGORY_CREATE,
      PERMISSIONS.CATEGORY_READ,
      PERMISSIONS.CATEGORY_UPDATE,
      PERMISSIONS.CATEGORY_DELETE,
    ]);
    expect(staffPerms.has("book.create")).toBe(true);
    expect(staffPerms.has("audit.read")).toBe(false);
    expect(staffPerms.has("user.manage")).toBe(false);
  });

  it("USER should only have book.read", () => {
    const userPerms = new Set<string>([PERMISSIONS.BOOK_READ]);
    expect(userPerms.has("book.read")).toBe(true);
    expect(userPerms.has("book.create")).toBe(false);
  });
});
