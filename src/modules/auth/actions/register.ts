"use server";

import { headers } from "next/headers";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";

import { registerUser } from "../services/auth.service";

export async function registerAction(input: unknown) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
    const userAgent = h.get("user-agent");

    const user = await registerUser(input, {
      ipAddress: ip,
      userAgent,
    });

    return success({ id: user.id, email: user.email }, "Akun berhasil dibuat. Silakan login.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
