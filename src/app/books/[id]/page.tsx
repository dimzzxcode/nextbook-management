import { notFound } from "next/navigation";
import { findBookById } from "@/modules/books/repositories/book.repository";
import Link from "next/link";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await findBookById(Number(id));
  if (!row) notFound();

  const { book, author, category } = row;

  return (
    <>
      <div className="section-head">
        <div>
          <h2>{book.title}</h2>
          <p>Detail buku</p>
        </div>
        <Link href={`/books/${book.id}/edit`} className="btn btn-primary">Edit</Link>
      </div>
      <div className="panel" style={{ padding: 24 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <div><strong>Judul:</strong> {book.title}</div>
          <div><strong>ISBN:</strong> {book.isbn || "-"}</div>
          <div><strong>Penulis:</strong> {author?.name || "-"}</div>
          <div><strong>Kategori:</strong> {category?.name || "-"}</div>
          <div><strong>Tahun:</strong> {book.publishedYear || "-"}</div>
          <div><strong>Deskripsi:</strong> {book.description || "-"}</div>
          <div><strong>Dibuat:</strong> {new Date(book.createdAt).toLocaleString("id-ID")}</div>
          {book.deletedAt && <div style={{ color: "#d93636" }}><strong>Status:</strong> Dihapus ({new Date(book.deletedAt).toLocaleString("id-ID")})</div>}
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Link href="/books" className="btn btn-ghost">Kembali</Link>
          {!book.deletedAt && <Link href={`/books/${book.id}/edit`} className="btn btn-primary">Edit Buku</Link>}
        </div>
      </div>
    </>
  );
}
