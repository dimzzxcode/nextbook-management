import { notFound } from "next/navigation";
import { findBookById } from "@/modules/books/repositories/book.repository";
import { db } from "@/shared/database";
import { authors, categories } from "@/shared/database/schema";
import EditBookForm from "./edit-book-form";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await findBookById(Number(id), { includeDeleted: true });
  if (!row) notFound();
  if (row.book.deletedAt) notFound();

  const [authorsList, categoriesList] = await Promise.all([
    db.select({ id: authors.id, name: authors.name }).from(authors).orderBy(authors.name).limit(100),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.name).limit(100),
  ]);

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Edit Buku</h2>
          <p>Perbarui informasi buku</p>
        </div>
      </div>
      <div className="panel" style={{ maxWidth: 640, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--primary-50)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Form Edit Buku</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Perbarui data: {row.book.title}</div>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <EditBookForm book={row.book} authors={authorsList} categories={categoriesList} />
        </div>
      </div>
    </>
  );
}
