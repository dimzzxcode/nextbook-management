"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { revokeSessionAction, revokeAllSessionsAction } from "@/modules/auth/actions/sessions";

type Session = { id: number; userAgent: string | null; ipAddress: string | null; createdAt: Date; expiresAt: Date; isCurrent: boolean };

export default function SessionsClient({ initialSessions }: { initialSessions: Session[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const revokeOne = (id: number) => {
    if (!confirm("Cabut sesi ini? Perangkat tersebut akan logout.")) return;
    setMsg(null);
    start(async () => {
      const res = await revokeSessionAction(id);
      if (res.success) { setSessions((s) => s.filter((x) => x.id !== id)); setMsg("Sesi dicabut."); setTimeout(()=>setMsg(null),3000); }
      else setMsg(res.error.message);
    });
  };

  const revokeAll = () => {
    if (!confirm("Cabut semua sesi lain? Anda akan tetap login di perangkat ini.")) return;
    setMsg(null);
    start(async () => {
      const res = await revokeAllSessionsAction();
      if (res.success) { setSessions((s) => s.filter((x) => x.isCurrent)); setMsg("Sesi lain dicabut."); setTimeout(()=>setMsg(null),3000); }
      else setMsg(res.error.message);
    });
  };

  return (
    <>
      {msg && <div style={{ background: msg.includes("dicabut") || msg.includes("Sesi") ? "#e3faec" : "#fdeaea", color: msg.includes("dicabut") || msg.includes("Sesi") ? "#0f9d58" : "#d93636", padding: "10px 12px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msg}</div>}

      <div className="panel">
        <div className="table-scroll">
          {sessions.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 15, color: "var(--text)" }}>Tidak ada sesi aktif</h4>
              <p style={{ margin: 0, fontSize: 13 }}>Sesi Anda telah berakhir. Silakan login kembali.</p>
              <Link href="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Masuk</Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Perangkat</th>
                  <th>IP Address</th>
                  <th>Dibuat</th>
                  <th>Kedaluwarsa</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} style={{ background: s.isCurrent ? "#f8fafc" : undefined }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                        <span style={{ width: 36, height: 36, borderRadius: 9, background: s.isCurrent ? "var(--primary)" : "var(--bg)", color: s.isCurrent ? "var(--white)" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: s.isCurrent ? "none" : "1px solid var(--border)", marginTop: 2 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flexWrap: "wrap" }}>
                            <span className="cell-title" style={{ whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "anywhere", lineHeight: 1.4 }}>{s.userAgent || "Unknown device"}</span>
                            {s.isCurrent && <span style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe", padding: "1px 6px", borderRadius: 999, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>Saat ini</span>}
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 2 }}>ID #{s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="cell-muted" style={{ fontFamily: "monospace", fontSize: 12 }}>{s.ipAddress || "—"}</span></td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap", fontSize: 12 }}>{new Date(s.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap", fontSize: 12 }}>{new Date(s.expiresAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td style={{ textAlign: "center" }}>
                      {s.isCurrent ? (
                        <span style={{ fontSize: 11, color: "var(--text-light)", fontStyle: "italic" }}>Aktif</span>
                      ) : (
                        <button onClick={() => revokeOne(s.id)} disabled={pending} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 12, color: "var(--danger-text)", borderColor: "#fde8e8" }}>{pending ? "..." : "Cabut"}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderTop: "1px solid var(--border)", background: "#f8fafc" }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>{sessions.length}</span> sesi aktif
            <span style={{ marginLeft: 8, color: "var(--text-light)" }}>• Perangkat terhubung</span>
          </div>
          <button className="btn btn-ghost" onClick={revokeAll} disabled={pending || sessions.filter((s) => !s.isCurrent).length === 0} style={{ fontSize: 13, padding: "6px 12px", color: "var(--danger-text)", borderColor: sessions.filter((s) => !s.isCurrent).length === 0 ? "var(--border)" : "#fde8e8", opacity: pending || sessions.filter((s) => !s.isCurrent).length === 0 ? 0.5 : 1 }}>
            Cabut Sesi Lain
          </button>
        </div>
      </div>
    </>
  );
}
