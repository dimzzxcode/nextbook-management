import { findBookList } from "@/modules/books/repositories/book.repository";
import { db } from "@/shared/database";
import { categories } from "@/shared/database/schema";
import Link from "next/link";
import BookRowActions from "./book-row-actions";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const search = params.search || "";
  const categoryId = params.categoryId ? Number(params.categoryId) : undefined;

  const result = await findBookList({
    page,
    limit: 10,
    search: search || undefined,
    categoryId,
    sortBy: "newest",
    status: "available",
  });
  const cats = await db.select().from(categories).limit(20);

  return (
    <>
      <style>{`thead th:first-child{width:28%}thead th:nth-child(2){width:18%}thead th:nth-child(3){width:18%}thead th:nth-child(4){width:10%}thead th:nth-child(5){width:12%}thead th:last-child{width:14%;text-align:center}tbody td:last-child{padding:10px 12px;text-align:center}`}</style>
      <div className="section-head">
        <div>
          <h2>Buku</h2>
          <p>Kelola koleksi buku perpustakaan</p>
        </div>
        <Link href="/books/new" className="btn btn-primary">
          Tambah Buku
        </Link>
      </div>

      <div className="panel">
        <form className="table-toolbar" method="GET">
          <div className="search-box">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              name="search"
              placeholder="Cari judul, ISBN, penulis..."
              defaultValue={search}
            />
          </div>
          <select
            name="categoryId"
            className="filter-select"
            defaultValue={categoryId || ""}
          >
            <option value="">Semua Kategori</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="btn btn-ghost"
            style={{ height: 38 }}
          >
            Cari
          </button>
        </form>

        <div className="table-scroll">
          {result.data.length === 0 ? (
            <div
              className="empty"
              style={{
                padding: 40,
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: 16,
                  color: "var(--text)",
                }}
              >
                Tidak ada buku
              </h4>
              <p>Belum ada buku yang sesuai dengan pencarian.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Buku</th>
                  <th>Penulis</th>
                  <th>Kategori</th>
                  <th>Tahun</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map(({ book, author, category }) => (
                  <tr key={book.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 9,
                            background: "var(--primary-50)",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            className="cell-title"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 180,
                              lineHeight: 1.3,
                            }}
                          >
                            {book.title}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: "var(--text-light)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 180,
                            }}
                          >
                            {book.isbn || "Tanpa ISBN"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="cell-muted"
                        style={{ display: "block", maxWidth: 140 }}
                        title={author?.name || ""}
                      >
                        {author?.name || "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        className="cell-muted"
                        style={{ display: "block", maxWidth: 140 }}
                        title={category?.name || ""}
                      >
                        {category?.name || "—"}
                      </span>
                    </td>
                    <td
                      className="cell-muted"
                      style={{ whiteSpace: "nowrap", textAlign: "center" }}
                    >
                      {book.publishedYear || "—"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="badge badge-success">Tersedia</span>
                    </td>
                    <td>
                      <BookRowActions id={book.id} title={book.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div
          style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            borderTop: "1px solid var(--border)",
            background: "#f8fafc",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>
              {result.pagination.total}
            </span>{" "}
            buku ditemukan
            {result.pagination.total > 0 && (
              <span style={{ marginLeft: 8, color: "var(--text-light)" }}>
                • Halaman {result.pagination.page} dari{" "}
                {result.pagination.totalPages}
              </span>
            )}
          </div>
          {result.pagination.totalPages > 1 ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {result.pagination.page > 1 && (
                <Link
                  href={`/books?page=${result.pagination.page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${categoryId ? `&categoryId=${categoryId}` : ""}`}
                  className="btn btn-ghost"
                  style={{ padding: "6px 10px", fontSize: 13 }}
                >
                  ‹ Prev
                </Link>
              )}
              {Array.from(
                { length: result.pagination.totalPages },
                (_, i) => i + 1,
              ).map((p) => (
                <Link
                  key={p}
                  href={`/books?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}${categoryId ? `&categoryId=${categoryId}` : ""}`}
                  className={`btn ${p === result.pagination.page ? "btn-primary" : "btn-ghost"}`}
                  style={{
                    padding: "6px 12px",
                    fontSize: 13,
                    minWidth: 36,
                    justifyContent: "center",
                  }}
                >
                  {p}
                </Link>
              ))}
              {result.pagination.page < result.pagination.totalPages && (
                <Link
                  href={`/books?page=${result.pagination.page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${categoryId ? `&categoryId=${categoryId}` : ""}`}
                  className="btn btn-ghost"
                  style={{ padding: "6px 10px", fontSize: 13 }}
                >
                  Next ›
                </Link>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--text-light)" }}>
              {result.data.length > 0
                ? `Menampilkan ${result.data.length} data`
                : ""}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
