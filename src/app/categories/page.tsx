import Link from "next/link";
import { findCategoryList } from "@/modules/categories/repositories/category.repository";
import CategoryTableActions from "./category-table-actions";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const result = await findCategoryList({
    search: params.search,
    page,
    limit: 10,
    sortBy: "newest",
  });

  return (
    <>
      <style>{`thead th:first-child{width:34%}thead th:nth-child(2){width:36%}thead th:nth-child(3){width:15%}thead th:last-child{width:15%;text-align:center} thead th:first-child{width:34%}thead th:nth-child(2){width:36%}thead th:nth-child(3){width:15%}thead th:last-child{width:15%;text-align:center}tbody td:last-child{padding:10px 12px;text-align:center}`}</style>

      <div className="section-head">
        <div>
          <h2>Kategori</h2>
          <p>Kelompokkan koleksi buku</p>
        </div>
        <Link href="/categories/new" className="btn btn-primary">
          Tambah Kategori
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
              placeholder="Cari kategori, deskripsi..."
              defaultValue={params.search || ""}
            />
          </div>
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
            <div className="empty">
              <h4>Tidak ada kategori</h4>
              <p>Belum ada kategori yang sesuai dengan pencarian.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama Kategori</th>
                  <th>Deskripsi</th>
                  <th>Dibuat</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((c) => (
                  <tr key={c.id}>
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
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
                            <circle
                              cx="7"
                              cy="7"
                              r="1.2"
                              fill="currentColor"
                              stroke="none"
                            />
                          </svg>
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            className="cell-title"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 220,
                              lineHeight: 1.3,
                            }}
                          >
                            {c.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="cell-muted"
                        style={{
                          display: "block",
                          maxWidth: 320,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={c.description || ""}
                      >
                        {c.description || "—"}
                      </span>
                    </td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap" }}>
                      {new Date(c.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <CategoryTableActions id={c.id} name={c.name} />
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
            kategori ditemukan
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
                  href={`/categories?page=${result.pagination.page - 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}`}
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
                  href={`/categories?page=${p}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}`}
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
                  href={`/categories?page=${result.pagination.page + 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}`}
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
