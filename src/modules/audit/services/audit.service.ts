import { auditLogs } from "@/shared/database/schema";
import { db } from "@/shared/database";

export type AuditInput = {
  userId?: number | null;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function logAuditEvent(input: AuditInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: input.userId ?? null,
      action: input.action,
      resource: input.resource ?? null,
      resourceId: input.resourceId ?? null,
      metadata: input.metadata ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });
  } catch (err) {
    // Audit failure should not break main flow — log to console only
    console.error("[AuditLog] failed", err);
  }
}
