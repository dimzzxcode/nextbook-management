import Link from "next/link";
import { requireAuth } from "@/modules/auth/services/require-auth";
import { findUserList } from "@/modules/users/repositories/user.repository";
import UserTableActions from "./user-table-actions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; roleName?: string }>;
}) {
  const user = await requireAuth()
    .then((u) => ({ name: u.name, email: u.email, role: u.role }))
    .catch(() => ({ name: "Guest", email: "", role: "USER" }));
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const result: Awaited<ReturnType<typeof findUserList>> = await findUserList({
    search: params.search,
    page,
    limit: 10,
    sortBy: "newest",
    roleName: params.roleName as "ADMIN" | "STAFF" | "USER" | undefined,
  }).catch(
    () =>
      ({
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      }) as Awaited<ReturnType<typeof findUserList>>,
  );

  return (
    <>
      <style>{`thead th:first-child{width:32%}thead th:nth-child(2){width:32%}thead th:nth-child(3){width:16%}thead th:last-child{width:20%;text-align:center} thead th:first-child{width:32%}thead th:nth-child(2){width:32%}thead th:nth-child(3){width:16%}thead th:last-child{width:20%;text-align:center}tbody td:last-child{padding:10px 12px;text-align:center}`}</style>

      <div className="section-head">
        <div>
          <h2>User</h2>
          <p>Kelola pengguna dan role</p>
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
              placeholder="Cari nama, email..."
              defaultValue={params.search || ""}
            />
          </div>
          <select
            name="roleName"
            defaultValue={params.roleName || ""}
            style={{
              height: 38,
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--white)",
              padding: "0 10px",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            <option value="">Semua Role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="USER">USER</option>
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
            <div className="empty">
              <h4>Tidak ada user</h4>
              <p>Belum ada user yang sesuai dengan pencarian.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((u) => {
                  const roleName = u.roleName ?? "USER";
                  return (
                    <tr key={u.id}>
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
                              background:
                                roleName === "ADMIN"
                                  ? "#eff6ff"
                                  : roleName === "STAFF"
                                    ? "#e3faec"
                                    : "#f3f6fb",
                              color:
                                roleName === "ADMIN"
                                  ? "#2563eb"
                                  : roleName === "STAFF"
                                    ? "#0f9d58"
                                    : "#64748b",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {u.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div
                              className="cell-title"
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 180,
                              }}
                            >
                              {u.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11.5,
                                color: "var(--text-light)",
                              }}
                            >
                              ID #{u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="cell-muted"
                          style={{ display: "block", maxWidth: 220 }}
                          title={u.email}
                        >
                          {u.email}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${roleName === "ADMIN" ? "badge-admin" : roleName === "STAFF" ? "badge-staff" : "badge-user"}`}
                        >
                          {roleName}
                        </span>
                      </td>
                      <td>
                        <UserTableActions
                          user={{ ...u, roleName }}
                          currentUserId={user.email === u.email ? u.id : undefined}
                        />
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
            user ditemukan
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
                  href={`/users?page=${result.pagination.page - 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}${params.roleName ? `&roleName=${params.roleName}` : ""}`}
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
                  href={`/users?page=${p}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}${params.roleName ? `&roleName=${params.roleName}` : ""}`}
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
                  href={`/users?page=${result.pagination.page + 1}${params.search ? `&search=${encodeURIComponent(params.search)}` : ""}${params.roleName ? `&roleName=${params.roleName}` : ""}`}
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
