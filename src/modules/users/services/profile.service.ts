import { z } from "zod";
import { getAuditMeta } from "@/shared/utils/audit-meta";

import { notFoundError } from "@/shared/errors";
import { parseOrThrow } from "@/shared/validation/helpers";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { logAuditEvent } from "@/modules/audit/services/audit.service";
import * as userRepo from "../repositories/user.repository";
import { eq } from "drizzle-orm";
import { db } from "@/shared/database";
import { users } from "@/shared/database/schema";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(100).optional(),
});

export async function getOwnProfile() {
  const currentUser = await requireAuth();
  // Resource-level: hanya boleh akses profile sendiri
  const profile = await userRepo.findUserById(currentUser.id);
  if (!profile) throw notFoundError("Profile tidak ditemukan.");
  return profile;
}

export async function updateOwnProfile(rawInput: unknown) {
  const currentUser = await requireAuth();
  const input = parseOrThrow(updateProfileSchema, rawInput);

  if (!input.name) return getOwnProfile();

  const updated = await db
    .update(users)
    .set({ name: input.name, updatedAt: new Date() })
    .where(eq(users.id, currentUser.id))
    .returning({ id: users.id, name: users.name, email: users.email })
    .then((r) => r[0]);

  if (!updated) throw notFoundError("Gagal update profile.");

  const meta = await getAuditMeta();
  await logAuditEvent({
    userId: currentUser.id,
    action: "PROFILE_UPDATED",
    resource: "user",
    resourceId: String(currentUser.id),
    metadata: { name: updated.name },
    ipAddress: meta.ip,
    userAgent: meta.ua,
  });

  return updated;
}
