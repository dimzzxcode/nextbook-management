import CreateCategoryForm from "./create-category-form";

export default async function NewCategoryPage() {
  return (
    <>
      <div className="section-head">
        <div><h2>Tambah Kategori</h2><p>Buat kategori baru</p></div>
      </div>
      <div className="panel" style={{ maxWidth: 480, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--primary-50)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" /><circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" /></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Form Kategori Baru</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Kategori membantu mengelompokkan buku</div>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <CreateCategoryForm />
        </div>
      </div>
    </>
  );
}
