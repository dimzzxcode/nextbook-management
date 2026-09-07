"use client";
import { useState, useTransition } from "react";
import { updateOwnProfileAction } from "@/modules/users/actions/profile.actions";

export default function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);
    start(async () => {
      const res = await updateOwnProfileAction({ name });
      if (res.success) setMsg("Profile diperbarui.");
      else setErr(res.error.message);
    });
  };

  const sectionStyle: React.CSSProperties = { background: "#fbfdff", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 14 };
  const headStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 };
  const dot: React.CSSProperties = { width: 8, height: 8, borderRadius: 999, background: "var(--primary)" };

  return (
    <form onSubmit={handle}>
      {msg && <div style={{ background: "#e3faec", color: "#0f9d58", padding: "10px 12px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msg}</div>}
      {err && <div style={{ background: "#fdeaea", color: "#d93636", padding: "10px 12px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{err}</div>}

      <div style={sectionStyle}>
        <div style={headStyle}><span style={dot} /> Ubah Nama</div>
        <div style={{ marginBottom: 0 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nama Lengkap <span style={{ color: "#d93636" }}>*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13 }} />
          <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 4 }}>{name.length}/100 karakter</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <button type="submit" className="btn btn-primary" disabled={pending} style={{ width: "100%" }}>{pending ? "Menyimpan..." : "Simpan Perubahan"}</button>
      </div>
    </form>
  );
}
