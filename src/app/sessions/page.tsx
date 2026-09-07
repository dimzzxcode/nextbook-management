import { requireAuth } from "@/modules/auth/services/require-auth";
import { getActiveSessions } from "@/modules/auth/services/session.service";
import { getRefreshToken } from "@/modules/auth/services/cookie.service";
import { sha256 } from "@/shared/utils/hash";
import { db } from "@/shared/database";
import { sessions } from "@/shared/database/schema";
import { eq } from "drizzle-orm";
import SessionsClient from "./sessions-client";
import Link from "next/link";

export default async function SessionsPage() {
  const user = await requireAuth();
  const list = await getActiveSessions(user.id);

  let currentId: number | null = null;
  try {
    const refresh = await getRefreshToken();
    if (refresh) {
      const hash = sha256(refresh);
      const cur = await db
        .select({ id: sessions.id })
        .from(sessions)
        .where(eq(sessions.tokenHash, hash))
        .limit(1)
        .then((r) => r[0]);
      currentId = cur?.id ?? null;
    }
  } catch {}

  const data = list.map((s) => ({ ...s, isCurrent: currentId === s.id }));

  return (
    <>
      <style>{`thead th:first-child{width:36%}thead th:nth-child(2){width:14%}thead th:nth-child(3){width:18%}thead th:nth-child(4){width:16%}thead th:last-child{width:16%;text-align:center} thead th:first-child{width:36%}thead th:nth-child(2){width:14%}thead th:nth-child(3){width:18%}thead th:nth-child(4){width:16%}thead th:last-child{width:16%;text-align:center}tbody td:last-child{text-align:center}`}</style>

      <div className="section-head">
        <div>
          <h2>Sesi Aktif</h2>
          <p>Kelola sesi login Anda di berbagai perangkat</p>
        </div>
        <Link href="/profile" className="btn btn-ghost">
          Profile
        </Link>
      </div>

      <SessionsClient initialSessions={data} />
    </>
  );
}
