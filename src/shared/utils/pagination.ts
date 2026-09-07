import { PAGINATION } from "@/shared/constants";
import type { PaginationParams } from "@/types";

export function normalizePagination(
  input: Partial<PaginationParams> & { page?: unknown; limit?: unknown }
): PaginationParams {
  let page = Number(input.page);
  let limit = Number(input.limit);

  if (!Number.isFinite(page) || page < 1) page = PAGINATION.DEFAULT_PAGE;
  if (!Number.isFinite(limit) || limit < 1) limit = PAGINATION.DEFAULT_LIMIT;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  return { page: Math.floor(page), limit: Math.floor(limit) };
}

export function getOffset(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
) {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    },
  };
}
