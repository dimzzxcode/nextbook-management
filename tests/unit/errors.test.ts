import { describe, it, expect } from "vitest";
import {
  validationError,
  authenticationError,
  authorizationError,
  notFoundError,
  conflictError,
  rateLimitedError,
  internalError,
  toErrorResponse,
} from "@/shared/errors/app-error";

describe("AppError & toErrorResponse", () => {
  it("should create validation error 400", () => {
    const err = validationError("Data tidak valid.", { field: "email" });
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.statusCode).toBe(400);
    const res = toErrorResponse(err);
    expect(res.error.code).toBe("VALIDATION_ERROR");
    expect(res.success).toBe(false);
  });

  it("should create authentication error 401", () => {
    const res = toErrorResponse(authenticationError());
    expect(res.error.code).toBe("AUTHENTICATION_ERROR");
  });

  it("should create authorization error 403", () => {
    const res = toErrorResponse(authorizationError("No access"));
    expect(res.error.code).toBe("AUTHORIZATION_ERROR");
  });

  it("should create not found 404", () => {
    const res = toErrorResponse(notFoundError("Not found"));
    expect(res.error.code).toBe("NOT_FOUND");
  });

  it("should create conflict 409", () => {
    const res = toErrorResponse(conflictError("Dup"));
    expect(res.error.code).toBe("CONFLICT");
  });

  it("should create rate limited 429", () => {
    const res = toErrorResponse(rateLimitedError("Too many"));
    expect(res.error.code).toBe("RATE_LIMITED");
  });

  it("should sanitize unknown error to internal", () => {
    const res = toErrorResponse(new Error("DB password failed for user postgres"));
    expect(res.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(res.error.message).toBe("Terjadi kesalahan pada server.");
    expect((res.error as any).details).toBeUndefined();
  });

  it("should not expose stack", () => {
    const err = new Error("secret token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.verylongstringwithmorethan30chars");
    const res = toErrorResponse(err);
    expect(res.error.code).toBe("INTERNAL_SERVER_ERROR");
    // message should be generic
    expect(res.error.message).not.toContain("eyJhbGci");
  });
});
