import Link from "next/link";
import { findAuthorList } from "@/modules/authors/repositories/author.repository";
import AuthorTableActions from "./author-table-actions";

export default async function AuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const result = await findAuthorList({
    page,
    limit: 10,
    search: params.search,
    sortBy: "newest",
  });

  return (
    <>
      <style>{`thead th:first-child{width:34%}thead th:nth-child(2){width:36%}thead th:nth-child(3){width:15%}thead th:last-child{width:15%;text-align:center} thead th:first-child{width:34%}thead th:nth-child(2){width:36%}thead th:nth-child(3){width:15%}thead th:last-child{width:15%;text-align:center}tbody td:last-child{padding:10px 12px;text-align:center}`}</style>

      <div className="section-head">
        <div>
          <h2>Penulis</h2>
          <p>Kelola data penulis</p>
        </div>
        <Link href="/authors/new" className="btn btn-primary">Tambah Penulis</Link>
      </div>

      <div className="panel">
        <form className="table-toolbar" method="GET">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" name="search" placeholder="Cari penulis, biografi..." defaultValue={params.search || ""} />
          </div>
          <button type="submit" className="btn btn-ghost" style={{ height: 38 }}>Cari</button>
        </form>

        <div className="table-scroll">
          {result.data.length === 0 ? (
            <div className="empty">
              <h4>Tidak ada penulis</h4>
              <p>Belum ada penulis yang sesuai dengan pencarian.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama Penulis</th>
                  <th>Biografi</th>
                  <th>Dibuat</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--primary-50)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div className="cell-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220, lineHeight: 1.3 }}>{a.name}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="cell-muted" style={{ display: "block", maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={a.biography || ""}>{a.biography || "—"}</span></td>
                    <td className="cell-muted" style={{ whiteSpace: "nowrap" }}>{new Date(a.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td><AuthorTableActions id={a.id} name={a.name} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderTop: "1px solid var(--border)", background: "#f8fafc" }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>{result.pagination.total}</span> penulis ditemukan
            {result.pagination.total > 0 && <span style={{ marginLeft: 8, color: "var(--text-light)" }}>• Halaman {result.pagination.page} dari {result.pagination.totalPages}</span>}
          </div>
          {result.pagination.totalPages > 1 ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {result.pagination.page > 1 && <Link href={`/authors?page=${result.pagination.page - 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}`} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 13 }}>‹ Prev</Link>}
              {Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/authors?page=${p}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}`} className={`btn ${p === result.pagination.page ? "btn-primary" : "btn-ghost"}`} style={{ padding: "6px 12px", fontSize: 13, minWidth: 36, justifyContent: "center" }}>{p}</Link>
              ))}
              {result.pagination.page < result.pagination.totalPages && <Link href={`/authors?page=${result.pagination.page + 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}`} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 13 }}>Next ›</Link>}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--text-light)" }}>{result.data.length > 0 ? `Menampilkan ${result.data.length} data` : ""}</div>
          )}
        </div>
      </div>
    </>
  );
}
