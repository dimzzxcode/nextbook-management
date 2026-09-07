"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAuthorAction } from "@/modules/authors/actions/author.actions";

export default function CreateAuthorForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null); setFieldErrors({});
    if (!name.trim()) { setFieldErrors({ name: "Nama wajib diisi." }); return; }
    start(async () => {
      const res = await createAuthorAction({ name, biography: biography || undefined });
      if (res.success) { router.push("/authors"); router.refresh(); }
      else {
        if (res.error.code === "VALIDATION_ERROR" && (res.error as any).details?.fieldErrors) {
          const fe: Record<string, string> = {};
          for (const [k, v] of Object.entries((res.error as any).details.fieldErrors as Record<string, string[]>)) if (v?.[0]) fe[k] = v[0];
          setFieldErrors(fe);
        } else setServerError(res.error.message);
      }
    });
  };

  const sectionStyle: React.CSSProperties = { background: "#fbfdff", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 14 };
  const headStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 };
  const dot: React.CSSProperties = { width: 8, height: 8, borderRadius: 999, background: "var(--primary)" };

  return (
    <form onSubmit={handle} noValidate>
      {serverError && <div style={{ background: "#fdeaea", color: "#d93636", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{serverError}</div>}
      <div style={sectionStyle}>
        <div style={headStyle}><span style={dot} /> Informasi Penulis</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nama Penulis <span style={{ color: "#d93636" }}>*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Andrea Hirata" style={{ width: "100%", height: 40, padding: "0 12px", border: `1px solid ${fieldErrors.name ? "#d93636" : "var(--border)"}`, borderRadius: 6, fontSize: 13 }} />
          {fieldErrors.name && <div style={{ fontSize: 12, color: "#d93636", marginTop: 4 }}>{fieldErrors.name}</div>}
        </div>
        <div style={{ marginBottom: 0 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Biografi</label>
          <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={3} placeholder="Ceritakan sedikit tentang penulis..." style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "var(--white)" }} />
          <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 4 }}>{biography.length}/2000 karakter</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <button type="button" className="btn btn-ghost" onClick={() => history.back()} style={{ flex: 1 }} disabled={pending}>Batal</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={pending}>{pending ? "Menyimpan..." : "Simpan Penulis"}</button>
      </div>
    </form>
  );
}
