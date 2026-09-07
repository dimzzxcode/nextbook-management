import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/shared/validation/auth";
import { createBookSchema } from "@/shared/validation/book";
import { createAuthorSchema } from "@/shared/validation/author";
import { createCategorySchema } from "@/shared/validation/category";
import { bookListQuerySchema } from "@/shared/validation/query";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should pass valid data", () => {
      const res = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(res.success).toBe(true);
    });

    it("should fail on invalid email", () => {
      const res = registerSchema.safeParse({
        name: "John",
        email: "not-email",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(res.success).toBe(false);
    });

    it("should fail when password mismatch", () => {
      const res = registerSchema.safeParse({
        name: "John",
        email: "a@b.com",
        password: "Password123!",
        confirmPassword: "Different123!",
      });
      expect(res.success).toBe(false);
      if (!res.success) expect(res.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(true);
    });

    it("should fail on short password", () => {
      const res = registerSchema.safeParse({
        name: "John",
        email: "a@b.com",
        password: "short",
        confirmPassword: "short",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should pass valid login", () => {
      expect(loginSchema.safeParse({ email: "a@b.com", password: "secret" }).success).toBe(true);
    });
    it("should fail on invalid email", () => {
      expect(loginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(false);
    });
  });

  describe("createBookSchema", () => {
    it("should pass valid book", () => {
      const res = createBookSchema.safeParse({ title: "Clean Code", isbn: "978-123", publishedYear: 2008 });
      expect(res.success).toBe(true);
    });
    it("should fail on empty title", () => {
      expect(createBookSchema.safeParse({ title: "" }).success).toBe(false);
    });
    it("should fail on invalid isbn", () => {
      expect(createBookSchema.safeParse({ title: "Test", isbn: "abc!" }).success).toBe(false);
    });
  });

  describe("createAuthorSchema", () => {
    it("should pass valid", () => {
      expect(createAuthorSchema.safeParse({ name: "Author Name" }).success).toBe(true);
    });
    it("should fail empty", () => {
      expect(createAuthorSchema.safeParse({ name: "" }).success).toBe(false);
    });
  });

  describe("createCategorySchema", () => {
    it("should pass valid", () => {
      expect(createCategorySchema.safeParse({ name: "Fiction" }).success).toBe(true);
    });
    it("should fail empty", () => {
      expect(createCategorySchema.safeParse({ name: "" }).success).toBe(false);
    });
  });

  describe("bookListQuerySchema", () => {
    it("should parse pagination defaults", () => {
      const res = bookListQuerySchema.parse({});
      expect(res.page).toBe(1);
      expect(res.limit).toBe(10);
      expect(res.sortBy).toBe("newest");
    });
    it("should parse search & filter", () => {
      const res = bookListQuerySchema.parse({ page: "2", limit: "5", search: "code", sortBy: "title_asc" });
      expect(res.page).toBe(2);
      expect(res.search).toBe("code");
      expect(res.sortBy).toBe("title_asc");
    });
  });
});
