import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/modules/auth/services/password.service";

describe("Password Service (Argon2id)", () => {
  it("should hash password to argon2id format", async () => {
    const hash = await hashPassword("Password123!");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash.length).toBeGreaterThan(50);
  });

  it("should verify correct password", async () => {
    const hash = await hashPassword("Test12345");
    expect(await verifyPassword(hash, "Test12345")).toBe(true);
  });

  it("should reject wrong password", async () => {
    const hash = await hashPassword("Correct123");
    expect(await verifyPassword(hash, "Wrong123")).toBe(false);
  });

  it("should not store plaintext", async () => {
    const password = "Secret123!";
    const hash = await hashPassword(password);
    expect(hash).not.toContain(password);
    expect(hash).not.toBe(password);
  });

  it("should produce different hashes for same password (salt)", async () => {
    const h1 = await hashPassword("Same123!");
    const h2 = await hashPassword("Same123!");
    expect(h1).not.toBe(h2);
  });
});
