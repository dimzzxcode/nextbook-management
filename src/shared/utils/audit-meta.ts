import { headers } from "next/headers";

export async function getAuditMeta(): Promise<{ ip: string | null; ua: string | null }> {
  try {
    const h = await headers();
    return {
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null,
      ua: h.get("user-agent"),
    };
  } catch {
    return { ip: null, ua: null };
  }
}
