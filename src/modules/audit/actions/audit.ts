"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import { requirePermissionGuard } from "@/modules/auth/services/permission-guard";
import { db } from "@/shared/database";
import { auditLogs } from "@/shared/database/schema";
import { desc, eq } from "drizzle-orm";

/**
 * Contoh Task 8.3: Protect Features with Permission
 * View Audit Logs → audit.read
 * Authorization dilakukan di server sebelum business logic.
 */
export async function getAuditLogsAction(params?: {
  action?: string;
  userId?: number;
  limit?: number;
}) {
  try {
    await requirePermissionGuard("audit.read");

    const limit = Math.min(params?.limit ?? 20, 100);

    // Untuk sederhana, filter via JS setelah fetch — Phase 14 akan lengkapi dengan SQL filter + pagination
    const logs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return success(logs);
  } catch (err) {
    return toErrorResponse(err);
  }
}
