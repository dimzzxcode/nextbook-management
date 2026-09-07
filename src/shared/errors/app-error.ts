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

export function toErrorResponse(error: unknown): {
  success: false;
  error: { code: ErrorCode; message: string };
} {
  if (isAppError(error)) {
    return {
      success: false,
      error: { code: error.code, message: error.message },
    };
  }

  // Jangan expose detail internal ke client — log di server saja
  console.error("[Unhandled Error]", error);
  return {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Terjadi kesalahan pada server.",
    },
  };
}
