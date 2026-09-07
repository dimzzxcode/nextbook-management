import { db } from "@/shared/database";
import { authors, categories } from "@/shared/database/schema";
import CreateBookForm from "./create-book-form";

export default async function NewBookPage() {
  const [authorsList, categoriesList] = await Promise.all([
    db.select({ id: authors.id, name: authors.name }).from(authors).orderBy(authors.name).limit(100),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.name).limit(100),
  ]);

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Tambah Buku</h2>
          <p>Tambahkan koleksi baru ke perpustakaan</p>
        </div>
      </div>
      <div className="panel" style={{ maxWidth: 640, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--primary-50)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Form Buku Baru</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Lengkapi informasi buku dengan benar</div>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <CreateBookForm authors={authorsList} categories={categoriesList} />
        </div>
      </div>
    </>
  );
}
