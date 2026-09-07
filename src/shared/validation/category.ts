import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(100, "Nama kategori maksimal 100 karakter."),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter.")
    .optional()
    .or(z.literal("")),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.coerce.number().int().positive("ID kategori tidak valid."),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
