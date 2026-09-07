export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type SortOrder = "asc" | "desc";
