import CreateAuthorForm from "./create-author-form";

export default async function NewAuthorPage() {
  return (
    <>
      <div className="section-head"><div><h2>Tambah Penulis</h2><p>Tambahkan penulis baru</p></div></div>
      <div className="panel" style={{ maxWidth: 480, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--primary-50)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
          </div>
          <div><div style={{ fontWeight: 700, fontSize: 14 }}>Form Penulis Baru</div><div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Isi informasi penulis dengan benar</div></div>
        </div>
        <div style={{ padding: 24 }}><CreateAuthorForm /></div>
      </div>
    </>
  );
}
