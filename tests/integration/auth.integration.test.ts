import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/shared/database";
import { users } from "@/shared/database/schema";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { registerUser, loginUser } from "@/modules/auth/services/auth.service";
import { hasPermission } from "@/modules/auth/services/authorization.service";
import * as bookRepo from "@/modules/books/repositories/book.repository";
import { getActiveSessions, revokeSession } from "@/modules/auth/services/session.service";

const TEST_EMAIL = "integration_test20@example.com";
const TEST_PASS = "Integration123!";

let testUserId: number;
const sql = postgres(process.env.DATABASE_URL!);

async function cleanup() {
  const u = await db.select({ id: users.id }).from(users).where(eq(users.email, TEST_EMAIL)).limit(1).then(r=>r[0]);
  if (u) {
    await sql.unsafe(`DELETE FROM password_reset_tokens WHERE user_id = ${u.id}`);
    await sql.unsafe(`DELETE FROM sessions WHERE user_id = ${u.id}`);
    await sql.unsafe(`DELETE FROM audit_logs WHERE user_id = ${u.id}`);
    await sql.unsafe(`DELETE FROM books WHERE title LIKE 'Integration Book%'`);
    await db.delete(users).where(eq(users.id, u.id));
  }
}

describe("Integration: Auth Flow", () => {
  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await sql.end();
  });

  it("should register new user", async () => {
    const user = await registerUser({
      name: "Integration Tester",
      email: TEST_EMAIL,
      password: TEST_PASS,
      confirmPassword: TEST_PASS,
    });
    expect(user.email).toBe(TEST_EMAIL);
    testUserId = user.id;
    const dbUser = await db.select().from(users).where(eq(users.email, TEST_EMAIL)).limit(1).then(r=>r[0]);
    expect(dbUser).toBeDefined();
    expect(dbUser.passwordHash).not.toContain(TEST_PASS);
  });

  it("should not register duplicate email", async () => {
    await expect(
      registerUser({ name: "Dup", email: TEST_EMAIL, password: TEST_PASS, confirmPassword: TEST_PASS })
    ).rejects.toThrow();
  });

  it("should login with correct credentials and create session", async () => {
    const result = await loginUser({ email: TEST_EMAIL, password: TEST_PASS });
    expect(result.user.email).toBe(TEST_EMAIL);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.sessionId).toBeDefined();

    const sessions = await getActiveSessions(testUserId);
    expect(sessions.length).toBeGreaterThan(0);
  });

  it("should fail login with wrong password (generic message)", async () => {
    await expect(loginUser({ email: TEST_EMAIL, password: "Wrong123!" })).rejects.toThrow("Email atau password tidak valid.");
  });

  it("should have permission book.read but not book.create for USER", async () => {
    expect(await hasPermission(testUserId, "book.read")).toBe(true);
    expect(await hasPermission(testUserId, "book.create")).toBe(false);
  });

  it("should enforce permission on protected resource (book create should fail for USER via service would check)", async () => {
    // Simulate service permission check
    const allowed = await hasPermission(testUserId, "book.create");
    expect(allowed).toBe(false);
  });

  it("should create, list, and revoke sessions", async () => {
    const before = await getActiveSessions(testUserId);
    const countBefore = before.length;
    // Create another login (second session)
    await loginUser({ email: TEST_EMAIL, password: TEST_PASS });
    const after = await getActiveSessions(testUserId);
    expect(after.length).toBe(countBefore + 1);

    // Revoke one
    const toRevoke = after[0].id;
    await revokeSession(toRevoke, testUserId);
    const afterRevoke = await getActiveSessions(testUserId);
    expect(afterRevoke.length).toBe(after.length - 1);
  });

  it("should handle book repository integration (DB-side pagination)", async () => {
    // Create book directly via repo (bypass permission for integration)
    const book = await bookRepo.createBook({ title: "Integration Book Test", isbn: "999-999" });
    expect(book.title).toBe("Integration Book Test");

    const list = await bookRepo.findBookList({ search: "Integration Book", status: "available" });
    expect(list.pagination.total).toBeGreaterThanOrEqual(1);
    expect(list.data.some((d) => d.book.id === book.id)).toBe(true);

    // Soft delete
    const deleted = await bookRepo.softDeleteBook(book.id);
    expect(deleted?.deletedAt).toBeDefined();

    const afterDelete = await bookRepo.findBookList({ search: "Integration Book", status: "available" });
    expect(afterDelete.data.some((d) => d.book.id === book.id)).toBe(false);

    const deletedOnly = await bookRepo.findBookList({ search: "Integration Book", status: "deleted" });
    expect(deletedOnly.data.some((d) => d.book.id === book.id)).toBe(true);

    // Restore
    const restored = await bookRepo.restoreBook(book.id);
    expect(restored?.deletedAt).toBeNull();

    // Cleanup
    await bookRepo.hardDeleteBook(book.id);
  });
});
