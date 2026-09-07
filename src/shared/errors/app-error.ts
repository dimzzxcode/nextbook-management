export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function validationError(
  message = "Data tidak valid.",
  details?: unknown
): AppError {
  return new AppError("VALIDATION_ERROR", message, 400, details);
}

export function authenticationError(
  message = "Anda harus login untuk mengakses resource ini."
): AppError {
  return new AppError("AUTHENTICATION_ERROR", message, 401);
}

export function authorizationError(
  message = "Anda tidak memiliki izin untuk melakukan aksi ini."
): AppError {
  return new AppError("AUTHORIZATION_ERROR", message, 403);
}

export function notFoundError(
  message = "Resource tidak ditemukan."
): AppError {
  return new AppError("NOT_FOUND", message, 404);
}

export function conflictError(message: string): AppError {
  return new AppError("CONFLICT", message, 409);
}

export function rateLimitedError(
  message = "Terlalu banyak permintaan. Coba lagi nanti."
): AppError {
  return new AppError("RATE_LIMITED", message, 429);
}

export function internalError(
  message = "Terjadi kesalahan pada server."
): AppError {
  return new AppError("INTERNAL_SERVER_ERROR", message, 500);
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Sanitasi log: jangan tulis password, hash, token, secret ke log
const SENSITIVE_KEYS = ["password", "password_hash", "passwordHash", "token", "secret", "authorization"];
function sanitizeForLog(input: unknown): unknown {
  if (input === null || input === undefined) return input;
  if (typeof input === "string") {
    // Ganti token-like string yang panjang (>30) agar tidak bocor
    if (input.length > 30 && /[A-Za-z0-9-_]{20,}/.test(input)) return "[REDACTED]";
    return input;
  }
  if (Array.isArray(input)) return input.map(sanitizeForLog);
  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s.toLowerCase()))) {
        out[k] = "[REDACTED]";
      } else {
        out[k] = sanitizeForLog(v);
      }
    }
    return out;
  }
  return input;
}

function logServerError(error: unknown): void {
  // Di production, jangan log stack trace lengkap ke client, hanya di server
  // Dan sanitasi data sensitif
  const sanitized = sanitizeForLog(error);
  console.error("[Unhandled Error]", sanitized);
  if (error instanceof Error && error.stack && process.env.NODE_ENV !== "production") {
    console.error(error.stack);
  }
}

// Handle postgres/drizzle unique violation → conflict
function isPostgresUniqueError(error: unknown): boolean {
  const e = error as { code?: string; message?: string };
  return e?.code === "23505" || !!e?.message?.includes("unique") || !!e?.message?.includes("duplicate");
}

export function handleDatabaseError(error: unknown, fallbackMessage = "Terjadi kesalahan pada server."): AppError {
  if (isAppError(error)) return error;
  if (isPostgresUniqueError(error)) {
    return conflictError("Data sudah terdaftar.");
  }
  // Jangan expose detail DB
  logServerError(error);
  return internalError(fallbackMessage);
}

export function toErrorResponse(error: unknown): {
  success: false;
  error: { code: ErrorCode; message: string; details?: unknown };
} {
  if (isAppError(error)) {
    // Untuk validation, sertakan details (fieldErrors) yang sudah sanitasi
    if (error.code === "VALIDATION_ERROR" && error.details) {
      return {
        success: false,
        error: { code: error.code, message: error.message, details: sanitizeForLog(error.details) },
      };
    }
    return {
      success: false,
      error: { code: error.code, message: error.message },
    };
  }

  // ZodError yang belum di-wrap (jika ada yang lupa parseOrThrow)
  const zError = error as { name?: string; issues?: unknown };
  if (zError?.name === "ZodError" || zError?.issues) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Data tidak valid." },
    };
  }

  // Postgres unique → conflict
  if (isPostgresUniqueError(error)) {
    return {
      success: false,
      error: { code: "CONFLICT", message: "Data sudah terdaftar." },
    };
  }

  // Rate limit sudah AppError, tapi jika ada yang lain

  // Jangan expose detail internal ke client — log di server saja (sanitasi)
  logServerError(error);
  return {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Terjadi kesalahan pada server.",
    },
  };
}
