import { z } from "zod";

import { validationError } from "@/shared/errors";

export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.flatten();
    throw validationError("Data tidak valid.", details);
  }
  return result.data;
}

export async function parseOrThrowAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  const result = await schema.safeParseAsync(data);
  if (!result.success) {
    const details = result.error.flatten();
    throw validationError("Data tidak valid.", details);
  }
  return result.data;
}
