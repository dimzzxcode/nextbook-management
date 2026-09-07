import { z } from "zod";

const currentYear = new Date().getFullYear();

export const createBookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi.")
    .max(255, "Judul maksimal 255 karakter."),
  isbn: z
    .string()
    .trim()
    .max(20, "ISBN maksimal 20 karakter.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v))
    .refine(
      (v) => !v || /^[0-9-]+$/.test(v),
      "ISBN hanya boleh angka dan strip."
    )
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, "Deskripsi maksimal 2000 karakter.")
    .optional()
    .or(z.literal("")),
  publishedYear: z
    .coerce
    .number()
    .int("Tahun harus bilangan bulat.")
    .min(1000, "Tahun tidak valid.")
    .max(currentYear + 1, "Tahun tidak boleh di masa depan jauh.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  authorId: z.coerce
    .number()
    .int()
    .positive("Author tidak valid.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  categoryId: z.coerce
    .number()
    .int()
    .positive("Kategori tidak valid.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

export const updateBookSchema = createBookSchema.partial().extend({
  id: z.coerce.number().int().positive("ID buku tidak valid."),
});

export type UpdateBookInput = z.infer<typeof updateBookSchema>;
