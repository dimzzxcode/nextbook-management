import { describe, it, expect } from "vitest";
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/modules/auth/services/jwt.service";

const SECRET = "test-jwt-secret-min-32-characters-long-for-unit-test";
const REFRESH = "test-refresh-secret-min-32-chars-long-unit-test!!";

describe("JWT Service", () => {
  it("should generate and verify access token", async () => {
    const token = await generateAccessToken(
      { sub: "1", email: "test@example.com", role: "USER", roleId: 3 },
      SECRET,
      "15m"
    );
    expect(token.split(".")).toHaveLength(3);

    const payload = await verifyAccessToken(token, SECRET);
    expect(payload.sub).toBe("1");
    expect(payload.email).toBe("test@example.com");
    expect(payload.role).toBe("USER");
    expect(payload.roleId).toBe(3);
    expect(payload.iat).toBeDefined();
    expect(payload.exp).toBeDefined();
    expect(payload.exp! - payload.iat!).toBeGreaterThan(0);
  });

  it("should not contain password in payload", async () => {
    const token = await generateAccessToken(
      { sub: "1", email: "a@b.com", role: "ADMIN", roleId: 1 } as any,
      SECRET
    );
    const payload: any = await verifyAccessToken(token, SECRET);
    expect(payload.password).toBeUndefined();
    expect(payload.passwordHash).toBeUndefined();
  });

  it("should fail with wrong secret", async () => {
    const token = await generateAccessToken(
      { sub: "1", email: "a@b.com", role: "USER", roleId: 3 },
      SECRET
    );
    await expect(verifyAccessToken(token, "wrong-secret-min-32-chars-long-xxx")).rejects.toThrow();
  });

  it("should generate and verify refresh token with jti", async () => {
    const token = await generateRefreshToken({ sub: "1", jti: "99" }, REFRESH, "7d");
    const payload = await verifyRefreshToken(token, REFRESH);
    expect(payload.sub).toBe("1");
    expect(payload.jti).toBe("99");
  });

  it("should expire token (short exp)", async () => {
    const token = await generateAccessToken(
      { sub: "1", email: "a@b.com", role: "USER", roleId: 3 },
      SECRET,
      "1s"
    );
    await new Promise((r) => setTimeout(r, 1200));
    await expect(verifyAccessToken(token, SECRET)).rejects.toThrow();
  });
});
