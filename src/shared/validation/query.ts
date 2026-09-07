import { z } from "zod";

import { PAGINATION } from "@/shared/constants/app";

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(PAGINATION.DEFAULT_PAGE)
    .optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT)
    .optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const bookListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  search: z.string().trim().max(100).optional().or(z.literal("")),
  authorId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  categoryId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  publishedYear: z.coerce.number().int().min(1000).max(new Date().getFullYear() + 1).optional().or(z.literal("").transform(() => undefined)),
  sortBy: z.enum(["newest", "oldest", "title_asc", "title_desc"]).default("newest").optional(),
  status: z.enum(["available", "deleted", "all"]).default("available").optional(),
});

export type BookListQuery = z.infer<typeof bookListQuerySchema>;

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID tidak valid."),
});

export type IdParam = z.infer<typeof idParamSchema>;
