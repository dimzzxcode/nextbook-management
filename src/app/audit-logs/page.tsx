import Link from "next/link";
import { findAuditLogs } from "@/modules/audit/repositories/audit.repository";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    action?: string;
    resource?: string;
  }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const result: Awaited<ReturnType<typeof findAuditLogs>> = await findAuditLogs({
    search: params.search,
    action: params.action,
    resource: params.resource,
    page,
    limit: 10,
    sortBy: "newest",
  }).catch(
    () =>
      ({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      }) as Awaited<ReturnType<typeof findAuditLogs>>,
  );

  return (
    <>
      <style>{`thead th:first-child{width:22%}thead th:nth-child(2){width:16%}thead th:nth-child(3){width:16%}thead th:nth-child(4){width:22%}thead th:last-child{width:16%;text-align:center} .table-toolbar select{height:38px;border:1px solid var(--border);border-radius:6px;background:var(--white);padding:0 10px;font-size:13px;color:var(--text-muted)}thead th:first-child{width:22%}thead th:nth-child(2){width:16%}thead th:nth-child(3){width:16%}thead th:nth-child(4){width:22%}thead th:last-child{width:16%;text-align:center}tbody td:last-child{text-align:center}`}</style>

      <div className="section-head">
        <div>
          <h2>Audit Log</h2>
          <p>Riwayat aktivitas sistem</p>
        </div>
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
              placeholder="Cari aksi, resource..."
              defaultValue={params.search || ""}
            />
          </div>
          <select name="action" defaultValue={params.action || ""}>
            <option value="">Semua Aksi</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="USER_REGISTERED">USER_REGISTERED</option>
            <option value="USER_LOGOUT">USER_LOGOUT</option>
            <option value="BOOK_CREATED">BOOK_CREATED</option>
            <option value="BOOK_UPDATED">BOOK_UPDATED</option>
            <option value="BOOK_DELETED">BOOK_DELETED</option>
            <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
          </select>
          <select name="resource" defaultValue={params.resource || ""}>
            <option value="">Semua Resource</option>
            <option value="user">user</option>
            <option value="book">book</option>
            <option value="author">author</option>
            <option value="category">category</option>
            <option value="role">role</option>
            <option value="session">session</option>
          </select>
          <button
            type="submit"
            className="btn btn-ghost"
            style={{ height: 38 }}
          >
            Filter
          </button>
          {(params.search || params.action || params.resource) && (
            <Link
              href="/audit-logs"
              className="btn btn-ghost"
              style={{ height: 38, color: "var(--danger-text)" }}
            >
              Reset
            </Link>
          )}
        </form>

        <div className="table-scroll">
          {result.data.length === 0 ? (
            <div className="empty">
              <h4>Tidak ada log</h4>
              <p>Belum ada aktivitas yang sesuai dengan filter.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Aksi</th>
                  <th>Resource</th>
                  <th>User</th>
                  <th>Waktu</th>
                  <th style={{ textAlign: "center" }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((l) => {
                  const badgeClass =
                    l.resource === "book"
                      ? "badge-book"
                      : l.resource === "user"
                        ? "badge-user"
                        : "badge-audit";
                  return (
                    <tr key={l.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              background: l.action.includes("LOGIN")
                                ? "#0f9d58"
                                : l.action.includes("DELETE")
                                  ? "#d93636"
                                  : "var(--primary)",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            className="cell-title"
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 140,
                            }}
                          >
                            {l.action}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>
                          {l.resource || "—"}
                        </span>
                      </td>
                      <td>
                        <div style={{ minWidth: 0 }}>
                          <div
                            className="cell-title"
                            style={{
                              fontSize: 13,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 160,
                            }}
                          >
                            {l.userName || "System"}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: "var(--text-light)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 160,
                            }}
                          >
                            {l.userEmail ||
                              (l.userId ? `ID #${l.userId}` : "-")}
                          </div>
                        </div>
                      </td>
                      <td
                        className="cell-muted"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {new Date(l.createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            fontFamily: "monospace",
                          }}
                          title={l.resourceId || ""}
                        >
                          {l.resourceId ? `#${l.resourceId}` : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
            log ditemukan
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
                  href={`/audit-logs?page=${result.pagination.page - 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}${params.action ? `&action=${params.action}` : ""}${params.resource ? `&resource=${params.resource}` : ""}`}
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
                  href={`/audit-logs?page=${p}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}${params.action ? `&action=${params.action}` : ""}${params.resource ? `&resource=${params.resource}` : ""}`}
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
                  href={`/audit-logs?page=${result.pagination.page + 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}${params.action ? `&action=${params.action}` : ""}${params.resource ? `&resource=${params.resource}` : ""}`}
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
