"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import * as auditViewer from "../services/audit-viewer.service";

export async function listAuditLogsAction(query: unknown) {
  try {
    const result = await auditViewer.listAuditLogs(query);
    return success(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function getAuditDetailAction(id: unknown) {
  try {
    const data = await auditViewer.getAuditDetail(id);
    return success(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}
