import { z } from "zod";

export const createAuthorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama author wajib diisi.")
    .max(150, "Nama author maksimal 150 karakter."),
  biography: z
    .string()
    .trim()
    .max(2000, "Biografi maksimal 2000 karakter.")
    .optional()
    .or(z.literal("")),
});

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;

export const updateAuthorSchema = createAuthorSchema.partial().extend({
  id: z.coerce.number().int().positive("ID author tidak valid."),
});

export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
