import type { ErrorCode } from "@/shared/errors";

export type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ErrorResponse = {
  success: false;
  error: { code: ErrorCode; message: string; details?: unknown };
};

export function success<T>(
  data: T,
  message?: string
): SuccessResponse<T> {
  return { success: true, data, ...(message ? { message } : {}) };
}

export function failure(
  code: ErrorCode,
  message: string,
  details?: unknown
): ErrorResponse {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  };
}
