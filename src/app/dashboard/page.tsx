import Link from "next/link";
import { db } from "@/shared/database";
import {
  auditLogs,
  books,
  authors,
  categories,
  users,
} from "@/shared/database/schema";
import { count, desc, eq, isNull } from "drizzle-orm";
import { requireAuth } from "@/modules/auth/services/require-auth";

export default async function DashboardPage() {
  await requireAuth();

  const [bookCount, authorCount, categoryCount, userCount] = await Promise.all([
    db
      .select({ value: count() })
      .from(books)
      .where(isNull(books.deletedAt))
      .then((r) => Number(r[0].value)),
    db
      .select({ value: count() })
      .from(authors)
      .then((r) => Number(r[0].value)),
    db
      .select({ value: count() })
      .from(categories)
      .then((r) => Number(r[0].value)),
    db
      .select({ value: count() })
      .from(users)
      .then((r) => Number(r[0].value)),
  ]);

  const recentBooks = await db
    .select({
      id: books.id,
      title: books.title,
      isbn: books.isbn,
      createdAt: books.createdAt,
      authorName: authors.name,
    })
    .from(books)
    .leftJoin(authors, eq(books.authorId, authors.id))
    .where(isNull(books.deletedAt))
    .orderBy(desc(books.createdAt))
    .limit(5);

  const recentActivities: Array<{
    id: number;
    action: string;
    resource: string | null;
    createdAt: Date;
    userName: string | null;
  }> = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      resource: auditLogs.resource,
      createdAt: auditLogs.createdAt,
      userName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(5)
    .catch(() => []);

  return (
    <>
      <style>{`.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}.stat-card{background:var(--white);border:1px solid var(--border);border-left:3px solid var(--accent, var(--primary));border-radius:10px;padding:18px 20px;transition:transform 150ms ease, box-shadow 150ms ease;text-decoration:none;color:inherit;display:block}.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px -12px rgba(15,23,42,0.15);border-color:var(--primary-100)}.stat-card__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.stat-card__icon{width:36px;height:36px;border-radius:9px;background:var(--accent-bg, var(--primary-50));color:var(--accent, var(--primary));display:flex;align-items:center;justify-content:center}.stat-card__trend{font-size:12px;font-weight:700;color:var(--success-text);background:var(--success-bg);padding:2px 8px;border-radius:999px}.stat-card strong{display:block;font-size:26px;font-weight:800;letter-spacing:-0.02em}.stat-card span{color:var(--text-muted);font-size:13px}.panel__head a{font-size:13px;color:var(--primary);font-weight:600}.panel__head a:hover{color:var(--primary-600);text-decoration:underline}.grid-2{display:grid;grid-template-columns:1.6fr 1fr;gap:20px;align-items:start}.activity-list{padding:8px 12px}.activity-item{display:flex;gap:12px;padding:12px 8px;border-bottom:1px solid var(--border);transition:background 120ms ease}.activity-item:hover{background:#f8fafc}.activity-item:last-child{border-bottom:none}.activity-dot{width:8px;height:8px;border-radius:50%;background:var(--primary);margin-top:6px;flex-shrink:0}.activity-item p{margin:0;font-size:13px}.activity-item small{font-size:11.5px;color:var(--text-light);display:block;margin-top:2px}.activity-item time{font-size:11.5px;color:var(--text-light)}.quick-actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px}.quick-actions .btn{padding:10px 14px;font-size:13px}@media(max-width:1100px){.stat-grid{grid-template-columns:repeat(2,1fr)}.grid-2{grid-template-columns:1fr}}@media(max-width:520px){.stat-grid{grid-template-columns:1fr}}`}</style>

      <div className="section-head">
        <div>
          <h2>Dasbor</h2>
          <p>Ringkasan perpustakaan hari ini</p>
        </div>
      </div>

      <div className="quick-actions">
        <Link href="/books/new" className="btn btn-primary">
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
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>{" "}
          Tambah Buku
        </Link>
        <Link href="/books" className="btn btn-ghost">
          Lihat Buku
        </Link>
        <Link href="/categories/new" className="btn btn-ghost">
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
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>{" "}
          Kategori
        </Link>
        <Link href="/authors/new" className="btn btn-ghost">
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
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>{" "}
          Penulis
        </Link>
      </div>

      <div className="stat-grid">
        <Link
          href="/books"
          className="stat-card"
          style={
            {
              "--accent": "#2563eb",
              "--accent-bg": "#eff6ff",
            } as React.CSSProperties
          }
        >
          <div className="stat-card__top">
            <div className="stat-card__icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="stat-card__trend">
              {bookCount > 0 ? `${bookCount} aktif` : "Kosong"}
            </span>
          </div>
          <strong>{bookCount}</strong>
          <span>Total Buku (tersedia)</span>
        </Link>
        <Link
          href="/authors"
          className="stat-card"
          style={
            {
              "--accent": "#0f9d58",
              "--accent-bg": "#e3faec",
            } as React.CSSProperties
          }
        >
          <div className="stat-card__top">
            <div className="stat-card__icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </div>
          </div>
          <strong>{authorCount}</strong>
          <span>Penulis</span>
        </Link>
        <Link
          href="/categories"
          className="stat-card"
          style={
            {
              "--accent": "#b76e00",
              "--accent-bg": "#fff4e0",
            } as React.CSSProperties
          }
        >
          <div className="stat-card__top">
            <div className="stat-card__icon">
              <svg
                width="18"
                height="18"
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
            </div>
          </div>
          <strong>{categoryCount}</strong>
          <span>Kategori</span>
        </Link>
        <Link
          href="/users"
          className="stat-card"
          style={
            {
              "--accent": "#d93636",
              "--accent-bg": "#fdeaea",
            } as React.CSSProperties
          }
        >
          <div className="stat-card__top">
            <div className="stat-card__icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <strong>{userCount}</strong>
          <span>User</span>
        </Link>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel__head">
            <div>
              <h3>Buku Terbaru</h3>
              <p>5 buku terakhir ditambahkan</p>
            </div>
            <Link
              href="/books"
              style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}
            >
              Lihat semua →
            </Link>
          </div>
          <div className="activity-list">
            {recentBooks.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                <p style={{ margin: "0 0 12px" }}>Belum ada buku.</p>
                <Link
                  href="/books/new"
                  className="btn btn-primary"
                  style={{ fontSize: 13, padding: "8px 14px" }}
                >
                  Tambah Buku Pertama
                </Link>
              </div>
            ) : (
              recentBooks.map((b) => (
                <Link
                  key={b.id}
                  href={`/books/${b.id}`}
                  className="activity-item"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="activity-dot" />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {b.title}
                    </p>
                    <small>
                      {b.authorName || "Tanpa penulis"} •{" "}
                      {b.isbn || "Tanpa ISBN"}
                    </small>
                    <time>
                      {new Date(b.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel__head">
            <div>
              <h3>Aktivitas Terbaru</h3>
              <p>5 log terakhir</p>
            </div>
            <Link
              href="/audit-logs"
              style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600 }}
            >
              Lihat semua →
            </Link>
          </div>
          <div className="activity-list">
            {recentActivities.length === 0 ? (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                Belum ada aktivitas.
              </div>
            ) : (
              recentActivities.map((a) => (
                <div key={a.id} className="activity-item">
                  <div
                    className="activity-dot"
                    style={{
                      background: a.action.includes("DELETE")
                        ? "#d93636"
                        : a.action.includes("CREATED")
                          ? "#0f9d58"
                          : "var(--primary)",
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {a.action} {a.resource ? `• ${a.resource}` : ""}
                    </p>
                    <small>{a.userName || "System"}</small>
                    <time>
                      {new Date(a.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
