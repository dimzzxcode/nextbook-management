"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logoutAction } from "@/modules/auth/actions/logout";
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  Pencil,
  Users,
  FileClock,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dasbor", icon: "dashboard" },
  { href: "/books", label: "Buku", icon: "book" },
  { href: "/categories", label: "Kategori", icon: "category" },
  { href: "/authors", label: "Penulis", icon: "author" },
  { href: "/users", label: "User", icon: "user" },
  { href: "/audit-logs", label: "Audit Log", icon: "audit" },
];

function Icon({ name }: { name: string }) {
  const props = { size: 20, strokeWidth: 2 } as const;
  if (name === "dashboard") return <LayoutDashboard {...props} />;
  if (name === "book") return <BookOpen {...props} />;
  if (name === "category") return <Tag {...props} />;
  if (name === "author") return <Pencil {...props} />;
  if (name === "user") return <Users {...props} />;
  return <FileClock {...props} />;
}

export default function DashboardShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
      router.refresh();
    });
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const initials = (() => {
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();
  const roleColor =
    user.role === "ADMIN"
      ? { bg: "#eff6ff", text: "#2563eb", border: "#dbeafe" }
      : user.role === "STAFF"
        ? { bg: "#e3faec", text: "#0f9d58", border: "#b7f0d0" }
        : { bg: "#f3f6fb", text: "#64748b", border: "#e3e8f0" };

  return (
    <>
      <style>{`
        :root{--white:#ffffff;--bg:#f3f6fb;--primary:#2563eb;--primary-600:#1d4ed8;--primary-50:#eff6ff;--primary-100:#dbeafe;--text:#0f172a;--text-muted:#64748b;--text-light:#94a3b8;--border:#e3e8f0;--border-strong:#cbd5e1;--success-bg:#e3faec;--success-text:#0f9d58;--warning-bg:#fff4e0;--warning-text:#b76e00;--danger-bg:#fdeaea;--danger-text:#d93636;--radius-sm:6px;--radius-md:10px;--radius-lg:14px;--shadow-topbar:0 1px 0 rgba(15,23,42,0.05);--shadow-pop:0 12px 32px -8px rgba(15,23,42,0.18);--sidebar-w:248px;--sidebar-w-collapsed:76px;--topbar-h:64px;--transition:200ms cubic-bezier(0.4,0,0.2,1)}
        *{box-sizing:border-box}html,body{height:100%}body{margin:0;font-family:"Plus Jakarta Sans",system-ui,sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;font-size:14px;line-height:1.5}ul{list-style:none;margin:0;padding:0}a{color:inherit;text-decoration:none}button{font-family:inherit;cursor:pointer}input,select{font-family:inherit}svg{display:block;flex-shrink:0}:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
        .app{display:flex;min-height:100vh}.main-wrapper{flex:1;display:flex;flex-direction:column;min-width:0;margin-left:var(--sidebar-w);transition:margin-left var(--transition)}.app.is-collapsed .main-wrapper{margin-left:var(--sidebar-w-collapsed)}
        .sidebar{position:fixed;top:0;left:0;bottom:0;width:var(--sidebar-w);background:var(--primary);display:flex;flex-direction:column;z-index:40;transition:width var(--transition),transform var(--transition);box-shadow:2px 0 12px rgba(15,23,42,0.12)}.app.is-collapsed .sidebar{width:var(--sidebar-w-collapsed)}
        .sidebar__brand{height:var(--topbar-h);display:flex;align-items:center;gap:10px;padding:0 20px;border-bottom:1px solid rgba(255,255,255,0.15);flex-shrink:0;overflow:hidden}.sidebar__brand-mark{width:32px;height:32px;border-radius:9px;background:var(--white);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(15,23,42,0.12)}.sidebar__brand-text{font-weight:800;font-size:16.5px;letter-spacing:-0.01em;white-space:nowrap;transition:opacity var(--transition);color:var(--white)}.app.is-collapsed .sidebar__brand-text{opacity:0;width:0}.sidebar__nav{flex:1;padding:16px 12px;overflow-y:auto}.sidebar__nav::-webkit-scrollbar{width:4px}.sidebar__nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:999px}.sidebar__section-label{font-size:11px;font-weight:700;color:rgba(255,255,255,0.7);padding:0 12px;margin-bottom:8px;white-space:nowrap;transition:opacity var(--transition);letter-spacing:0.06em;text-transform:uppercase}.app.is-collapsed .sidebar__section-label{opacity:0}.nav-item{margin-bottom:4px;position:relative}.nav-link{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:var(--radius-sm);color:rgba(255,255,255,0.85);font-weight:500;border-left:3px solid transparent;white-space:nowrap;transition:background var(--transition),color var(--transition)}.nav-link:hover{background:rgba(255,255,255,0.12);color:var(--white)}.nav-item.is-active .nav-link{background:rgba(255,255,255,0.18);color:var(--white);border-left-color:var(--white);font-weight:600;box-shadow:0 2px 8px rgba(15,23,42,0.12)}.app.is-collapsed .nav-link{justify-content:center;padding:12px 0;border-left:none}.app.is-collapsed .nav-item.is-active .nav-link{background:rgba(255,255,255,0.2);border-radius:var(--radius-sm)}.nav-label{transition:opacity var(--transition)}.app.is-collapsed .nav-label{opacity:0;position:absolute;pointer-events:none}.app.is-collapsed .nav-link .nav-tooltip{position:absolute;left:calc(100% + 10px);top:50%;transform:translateY(-50%);background:var(--text);color:var(--white);padding:6px 10px;border-radius:var(--radius-sm);font-size:12.5px;font-weight:500;white-space:nowrap;opacity:0;visibility:hidden;transition:opacity var(--transition);z-index:10}.app.is-collapsed .nav-link:hover .nav-tooltip{opacity:1;visibility:visible}.nav-tooltip{display:none}.app.is-collapsed .nav-tooltip{display:block}.sidebar__footer{padding:14px 20px;border-top:1px solid var(--border);font-size:12px;color:var(--text-light);white-space:nowrap;overflow:hidden;flex-shrink:0}.app.is-collapsed .sidebar__footer{text-align:center;padding:14px 0}.app.is-collapsed .sidebar__footer .full-text{display:none}.sidebar__footer .mini-dot{display:none}.app.is-collapsed .sidebar__footer .mini-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--primary)}.sidebar-backdrop{display:none;position:fixed;inset:0;background:rgba(15,23,42,0.4);z-index:35}
        .topbar{height:var(--topbar-h);min-height:var(--topbar-h);max-height:var(--topbar-h);flex:0 0 var(--topbar-h);flex-shrink:0;box-sizing:border-box;background:var(--white);border-bottom:1px solid var(--border);box-shadow:var(--shadow-topbar);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:30;gap:16px}.topbar__left{display:flex;align-items:center;gap:16px;min-width:0;flex:1}.icon-btn{width:38px;height:38px;flex-shrink:0;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--white);color:var(--text-muted);display:flex;align-items:center;justify-content:center;transition:background var(--transition),color var(--transition),border-color var(--transition)}.icon-btn:hover{background:var(--primary-50);color:var(--primary);border-color:var(--primary-100)}.topbar__title{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;overflow:hidden}.topbar__title h1{margin:0;font-size:17px;font-weight:700;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;max-width:100%}.topbar__title p{margin:0;font-size:12.5px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3}        .topbar__right{display:flex;align-items:center;gap:10px;flex-shrink:0}.search-box{display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0 12px;height:38px;width:220px;color:var(--text-light)}.search-box input{border:none;background:transparent;outline:none;width:100%;font-size:13.5px;color:var(--text)}.search-box input::placeholder{color:var(--text-light)}.user-menu{position:relative;z-index:40}.user-menu__trigger{display:flex;align-items:center;gap:10px;padding:3px 12px 3px 4px;border:1px solid var(--border);border-radius:999px;background:var(--white);box-shadow:0 1px 2px rgba(15,23,42,0.06);transition:all var(--transition);max-width:200px;cursor:pointer;position:relative;z-index:41}.user-menu__trigger:hover{background:var(--bg);border-color:var(--border);box-shadow:0 2px 8px rgba(15,23,42,0.08)}.avatar{width:34px;height:34px;border-radius:50%;background:var(--primary);flex-shrink:0;position:relative;box-shadow:0 1px 3px rgba(37,99,235,0.15);letter-spacing:0.04em;text-transform:uppercase;overflow:hidden;display:flex;align-items:center;justify-content:center}.avatar span{color:#ffffff;font-weight:800;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;height:100%;text-align:center}.user-menu__name{text-align:left;display:none;min-width:0;flex:1}.user-menu__name strong{display:block;font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px;line-height:1.2;letter-spacing:-0.01em}.user-menu__name .role-badge{display:inline-flex;align-items:center;padding:1px 6px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:0.04em;margin-top:2px;border:1px solid;line-height:1}.user-menu__chevron{color:var(--text-light);transition:transform var(--transition);flex-shrink:0}.user-menu.is-open .user-menu__chevron{transform:rotate(180deg)}@media(min-width:640px){.user-menu__name{display:block}}.user-menu__dropdown{position:absolute;top:calc(100% + 12px);right:0;width:260px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);box-shadow:var(--shadow-pop);padding:0;overflow:hidden;opacity:0;visibility:hidden;transform:translateY(-4px);transition:all var(--transition);z-index:50;pointer-events:none}.user-menu.is-open .user-menu__dropdown{opacity:1;visibility:visible;transform:translateY(0);pointer-events:auto}.user-menu__header{padding:16px;background:linear-gradient(135deg, var(--primary-50) 0%, var(--bg) 100%);border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:center}.user-menu__header .avatar{width:44px;height:44px}.user-menu__header .avatar span{font-size:15px;letter-spacing:0.05em}.user-menu__info strong{display:block;font-size:14px;font-weight:700;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text)}.user-menu__info .email{display:block;font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;line-height:1.3}.user-menu__header .role-badge{margin-top:6px}.user-menu__body{padding:8px}.user-menu__item{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:none;background:transparent;border-radius:var(--radius-sm);font-size:13.5px;font-weight:500;color:var(--text);text-align:left;transition:all 120ms ease;cursor:pointer}.user-menu__item:hover{background:var(--primary-50);color:var(--primary-600)}.user-menu__item.is-danger:hover{background:var(--danger-bg);color:var(--danger-text)}.user-menu__item svg{flex-shrink:0}.user-menu__backdrop{position:fixed;inset:0;z-index:39;display:none}.user-menu.is-open ~ .user-menu__backdrop{display:block}
        .content{flex:1;padding:24px;max-width:1280px;width:100%;margin:0 auto}.view{display:block;animation:fade-in 260ms ease}@keyframes fade-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap}.section-head h2{margin:0 0 4px;font-size:20px;font-weight:700;letter-spacing:-0.01em}.section-head p{margin:0;color:var(--text-muted);font-size:13.5px}.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;border:1px solid transparent;transition:background var(--transition),border-color var(--transition),color var(--transition)}.btn-primary{background:var(--primary);color:var(--white)}.btn-primary:hover{background:var(--primary-600)}.btn-ghost{background:var(--white);color:var(--text);border-color:var(--border)}.btn-ghost:hover{border-color:var(--primary);color:var(--primary-600)}.btn:disabled{opacity:0.6;cursor:not-allowed}
        .sidebar__footer{padding:12px;flex-shrink:0;border-top:none}.sidebar__footer-card{background:var(--white);border:none;border-radius:10px;padding:12px;box-shadow:0 4px 12px rgba(15,23,42,0.15);display:flex;align-items:center;gap:10px;transition:all var(--transition)}.sidebar__footer-card__icon{width:32px;height:32px;border-radius:8px;background:var(--primary-50);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0}.sidebar__footer-card__text{flex:1;min-width:0}.sidebar__footer-card__title{font-size:12px;font-weight:700;color:var(--text);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sidebar__footer-card__sub{font-size:11px;color:var(--text-muted);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sidebar__footer .mini-dot{display:none}.app.is-collapsed .sidebar__footer{padding:12px 8px}.app.is-collapsed .sidebar__footer-card{padding:8px;justify-content:center;background:var(--white);border-radius:50%;width:40px;height:40px;margin:0 auto;box-shadow:0 2px 8px rgba(15,23,42,0.12)}.app.is-collapsed .sidebar__footer-card__text{display:none}.app.is-collapsed .sidebar__footer .mini-dot{display:none}
        .footer{position:sticky;bottom:0;z-index:20;padding:16px 24px;text-align:center;font-size:12.5px;color:var(--text-light);border-top:1px solid var(--border);background:var(--white);box-shadow:0 -1px 0 rgba(15,23,42,0.04)}.footer strong{color:var(--text-muted);font-weight:700}
        @media(max-width:768px){.sidebar{transform:translateX(-100%);width:var(--sidebar-w)}.app.is-mobile-open .sidebar{transform:translateX(0)}.app.is-collapsed .sidebar{width:var(--sidebar-w)}.app.is-collapsed .sidebar__brand-text,.app.is-collapsed .sidebar__section-label,.app.is-collapsed .nav-label{opacity:1;width:auto}.main-wrapper{margin-left:0 !important}.app.is-mobile-open .sidebar-backdrop{display:block}}
      `}</style>
      <div
        className={`app ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}
      >
        <aside className="sidebar">
          <div className="sidebar__brand">
            <div className="sidebar__brand-mark">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="sidebar__brand-text">Pustaka.id</span>
          </div>
          <nav className="sidebar__nav">
            <div className="sidebar__section-label">Menu Utama</div>
            <ul>
              {navItems.map((item) => (
                <li
                  key={item.href}
                  className={`nav-item ${isActive(item.href) ? "is-active" : ""}`}
                >
                  <Link href={item.href} className="nav-link">
                    <Icon name={item.icon} />
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-tooltip">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="sidebar__footer">
            <div className="sidebar__footer-card">
              <div className="sidebar__footer-card__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 0-9.5 4.5" /><path d="M12 2a10 10 0 0 1 9.5 4.5" /><path d="M12 12v6" /><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><circle cx="12" cy="12" r="10" opacity="0.15" /></svg>
              </div>
              <div className="sidebar__footer-card__text">
                <div className="sidebar__footer-card__title">v1.0</div>
                <div className="sidebar__footer-card__sub">Dimenzi Studio</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e", flexShrink: 0, boxShadow: "0 0 0 2px rgba(34,197,94,0.2)" }} title="Online" />
            </div>
          </div>
        </aside>
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
        <div className="main-wrapper">
          <header className="topbar">
            <div className="topbar__left">
              <button
                className="icon-btn"
                onClick={() => {
                  if (window.innerWidth <= 768) setMobileOpen((v) => !v);
                  else setCollapsed((v) => !v);
                }}
                aria-label="Toggle sidebar"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </button>
            </div>
            <div className="topbar__right">
              <div className="search-box" style={{ display: "none" }}>
                <input placeholder="Cari..." />
              </div>
              <div className={`user-menu ${userMenuOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="user-menu__trigger"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="avatar">
                    <span>{initials}</span>
                  </span>
                  <span className="user-menu__name">
                    <strong title={user.name}>{user.name}</strong>
                    <span
                      className="role-badge"
                      style={{
                        background: roleColor.bg,
                        color: roleColor.text,
                        borderColor: roleColor.border,
                      }}
                    >
                      {roleLabel}
                    </span>
                  </span>
                  <ChevronDown size={14} className="user-menu__chevron" />
                </button>
                <div className="user-menu__dropdown" role="menu">
                  <div className="user-menu__header" style={{ padding: 14, flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minWidth: 0 }}>
                      <span className="avatar" style={{ width: 42, height: 42, fontSize: 14 }}>
                        <span>{initials}</span>
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong title={user.name} style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 14, lineHeight: 1.2 }}>{user.name}</strong>
                        <span
                          className="role-badge"
                          style={{
                            background: roleColor.bg,
                            color: roleColor.text,
                            borderColor: roleColor.border,
                            fontSize: 10,
                            padding: "2px 6px",
                            marginTop: 4,
                            display: "inline-flex",
                          }}
                        >
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                    <span
                      title={user.email}
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                        background: "var(--white)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "6px 8px",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
                        <path d="M4 4h16v16H4z" opacity="0" />
                        <path d="M22 6c0-1.1-.9-2-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6Z" />
                        <path d="m2 7 8.97 6.16a2 2 0 0 0 2.06 0L22 7" />
                      </svg>
                      {user.email}
                    </span>
                  </div>
                  <div className="user-menu__body">
                    <Link
                      href="/profile"
                      className="user-menu__item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} /> Profile Saya
                    </Link>
                    <Link
                      href="/sessions"
                      className="user-menu__item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FileClock size={16} /> Sesi Aktif
                    </Link>
                    <div
                      style={{
                        height: 1,
                        background: "var(--border)",
                        margin: "6px 0",
                      }}
                    />
                    <button
                      className="user-menu__item is-danger"
                      onClick={handleLogout}
                      disabled={isPending}
                      role="menuitem"
                    >
                      <LogOut size={16} />
                      {isPending ? "Memproses..." : "Keluar"}
                    </button>
                  </div>
                </div>
              </div>
              {userMenuOpen && (
                <div
                  className="user-menu__backdrop"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden="true"
                />
              )}
            </div>
          </header>
          <main className="content">{children}</main>
          <footer className="footer">
            <span>
              © {new Date().getFullYear()} <strong>Dimenzi Studio</strong>.
              Seluruh hak cipta dilindungi.
            </span>
          </footer>
        </div>
      </div>
    </>
  );
}
