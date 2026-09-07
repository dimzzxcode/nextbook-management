import Link from "next/link";
import { getAuthUserOrNull } from "@/modules/auth/services/require-auth";

export const dynamic = "force-dynamic";

export default async function BerandaPage() {
  const user = await getAuthUserOrNull();
  const isAuthenticated = !!user;
  return (
    <>
      <style>{`
        *{box-sizing:border-box}*,*::before,*::after{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:"Plus Jakarta Sans",system-ui,-apple-system,sans-serif;background:var(--white);color:var(--text);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}ul{list-style:none;margin:0;padding:0}a{color:inherit;text-decoration:none}img,svg{display:block}button{font-family:inherit;cursor:pointer}:focus-visible{outline:2px solid var(--primary);outline-offset:2px}:root{--white:#ffffff;--bg:#f3f6fb;--primary:#2563eb;--primary-600:#1d4ed8;--primary-50:#eff6ff;--primary-100:#dbeafe;--text:#0f172a;--text-muted:#64748b;--text-light:#94a3b8;--border:#e3e8f0;--radius-sm:8px;--radius-md:12px;--radius-lg:18px;--max-w:1160px}.wrap{max-width:var(--max-w);margin:0 auto;padding:0 24px}.navbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);border-bottom:1px solid var(--border)}.navbar .wrap{display:flex;align-items:center;justify-content:space-between;height:72px}.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:17px}.brand-mark{width:34px;height:34px;border-radius:9px;background:var(--primary);color:var(--white);display:flex;align-items:center;justify-content:center}.nav-links{display:none;align-items:center;gap:32px;font-size:14px;font-weight:500;color:var(--text-muted)}.nav-links a:hover{color:var(--primary)}@media(min-width:860px){.nav-links{display:flex}}.nav-actions{display:flex;align-items:center;gap:10px}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border-radius:var(--radius-sm);font-size:14px;font-weight:600;border:1px solid transparent;transition:all 180ms ease;white-space:nowrap}.btn-primary{background:var(--primary);color:var(--white)}.btn-primary:hover{background:var(--primary-600);transform:translateY(-1px)}.btn-ghost{background:transparent;color:var(--text);border-color:var(--border)}.btn-ghost:hover{border-color:var(--primary);color:var(--primary-600)}.btn-lg{padding:14px 26px;font-size:15px}.hero{padding:88px 0 72px;position:relative;overflow:hidden}.hero::before{content:"";position:absolute;top:-120px;right:-140px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,var(--primary-50) 0%,transparent 70%);z-index:0}.hero .wrap{position:relative;z-index:1}.hero-inner{max-width:700px}.eyebrow-line{display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border:1px solid var(--border);border-radius:999px;font-size:13px;font-weight:600;color:var(--primary-600);margin-bottom:22px;background:var(--primary-50)}.eyebrow-line .dot{width:7px;height:7px;border-radius:50%;background:var(--primary)}.hero h1{font-size:clamp(32px,5vw,50px);font-weight:800;line-height:1.12;letter-spacing:-0.02em;margin:0 0 20px}.hero h1 .accent{color:var(--primary)}.hero p.lead{font-size:16.5px;color:var(--text-muted);max-width:540px;margin:0 0 32px}.hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:48px}.hero-stats{display:flex;gap:40px;flex-wrap:wrap;padding-top:28px;border-top:1px solid var(--border);max-width:560px}.hero-stats div strong{display:block;font-size:24px;font-weight:800;letter-spacing:-0.01em}.hero-stats div span{font-size:13px;color:var(--text-muted)}.preview{margin-top:56px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--bg);padding:6px;box-shadow:0 30px 60px -30px rgba(15,23,42,0.25)}.preview-inner{background:var(--white);border-radius:14px;border:1px solid var(--border);display:grid;grid-template-columns:200px 1fr;min-height:320px;overflow:hidden}.preview-side{background:var(--white);border-right:2px solid var(--primary);padding:20px 14px}.preview-dot-row{display:flex;gap:6px;margin-bottom:18px}.preview-dot-row span{width:9px;height:9px;border-radius:50%;background:var(--border)}.preview-menu-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:7px;font-size:12.5px;color:var(--text-muted);font-weight:500;margin-bottom:4px}.preview-menu-item.active{background:var(--primary-50);color:var(--primary-600);font-weight:600}.preview-menu-item .ic{width:14px;height:14px;border-radius:4px;background:currentColor;opacity:0.35;flex-shrink:0}.preview-main{padding:22px 24px}.preview-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.preview-stat{border:1px solid var(--border);border-left:3px solid var(--primary);border-radius:9px;padding:12px}.preview-stat b{display:block;font-size:18px;font-weight:800}.preview-stat span{font-size:10.5px;color:var(--text-light)}.preview-table{border:1px solid var(--border);border-radius:9px;overflow:hidden}.preview-row{display:flex;padding:10px 14px;border-bottom:1px solid var(--border);font-size:11.5px;color:var(--text-muted);align-items:center;gap:10px}.preview-row:last-child{border-bottom:none}.preview-row .t{flex:1;color:var(--text);font-weight:600}.preview-badge{padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:#e3faec;color:#0f9d58}@media(max-width:640px){.preview-inner{grid-template-columns:1fr}.preview-side{display:none}.preview-cards{grid-template-columns:repeat(2,1fr)}}.section{padding:88px 0}.section-bg{background:var(--bg)}.section-head{max-width:560px;margin:0 auto 48px;text-align:center}.section-head h2{font-size:clamp(26px,3.4vw,34px);font-weight:800;letter-spacing:-0.02em;margin:0 0 12px}.section-head p{color:var(--text-muted);margin:0;font-size:15.5px}.feature-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}@media(max-width:980px){.feature-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.feature-grid{grid-template-columns:1fr}}.feature-card{background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);padding:24px;transition:border-color 180ms ease,transform 180ms ease}.feature-card:hover{border-color:var(--primary-100);transform:translateY(-3px)}.feature-icon{width:42px;height:42px;border-radius:10px;background:var(--primary-50);color:var(--primary);display:flex;align-items:center;justify-content:center;margin-bottom:16px}.feature-card h3{font-size:15.5px;font-weight:700;margin:0 0 8px}.feature-card p{font-size:13.5px;color:var(--text-muted);margin:0}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}@media(max-width:780px){.steps{grid-template-columns:1fr}}.step{position:relative;padding-left:52px}.step-num{position:absolute;left:0;top:0;width:38px;height:38px;border-radius:10px;background:var(--primary);color:var(--white);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px}.step h4{margin:0 0 6px;font-size:15px;font-weight:700}.step p{margin:0;font-size:13.5px;color:var(--text-muted)}.cta-banner{max-width:var(--max-w);margin:0 auto;background:var(--primary);border-radius:var(--radius-lg);padding:56px 40px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;color:var(--white)}.cta-banner h3{margin:0 0 6px;font-size:24px;font-weight:800;letter-spacing:-0.01em}.cta-banner p{margin:0;color:var(--primary-100);font-size:14px}.cta-banner .btn-primary{background:var(--white);color:var(--primary-600)}.cta-banner .btn-primary:hover{background:var(--primary-50)}.site-footer{border-top:1px solid var(--border);padding:48px 0 24px}.footer-top{display:flex;justify-content:space-between;gap:32px;flex-wrap:wrap;margin-bottom:32px}.footer-brand p{color:var(--text-muted);font-size:13.5px;max-width:280px;margin:12px 0 0}.footer-cols{display:flex;gap:56px;flex-wrap:wrap}.footer-col h5{font-size:13px;margin:0 0 14px;color:var(--text)}.footer-col a{display:block;font-size:13.5px;color:var(--text-muted);margin-bottom:10px}.footer-col a:hover{color:var(--primary)}.footer-bottom{border-top:1px solid var(--border);padding-top:20px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:12.5px;color:var(--text-light)}.footer-bottom strong{color:var(--text-muted)}
      `}</style>

      <header className="navbar">
        <div className="wrap">
          <Link href="/" className="brand">
            <span className="brand-mark">
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
            </span>
            Pustaka.id
          </Link>
          <nav className="nav-links">
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara kerja</a>
            <a href="#tentang">Tentang</a>
          </nav>
          <div className="nav-actions">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">
                  Masuk
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="hero-inner">
            <span className="eyebrow-line">
              <span className="dot" /> Untuk perpustakaan sekolah, kampus &
              komunitas
            </span>
            <h1>
              Kelola perpustakaan Anda
              <br />
              lebih rapi dan <span className="accent">modern</span>
            </h1>
            <p className="lead">
              Pustaka membantu Anda mencatat koleksi buku, kategori, dan anggota
              dalam satu dasbor yang sederhana — tanpa lagi mengandalkan buku
              catatan atau spreadsheet manual.
            </p>
            <div className="hero-cta">
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn btn-primary btn-lg">
                  Buka Dashboard
                </Link>
              ) : (
                <Link href="/register" className="btn btn-primary btn-lg">
                  Mulai sekarang, gratis
                </Link>
              )}
              <a href="#fitur" className="btn btn-ghost btn-lg">
                Lihat fitur
              </a>
            </div>
            <div className="hero-stats">
              <div>
                <strong>12.400+</strong>
                <span>Judul buku terkelola</span>
              </div>
              <div>
                <strong>340</strong>
                <span>Kategori tersusun</span>
              </div>
              <div>
                <strong>5.200</strong>
                <span>Anggota aktif</span>
              </div>
            </div>
          </div>
          <div className="preview" aria-hidden="true">
            <div className="preview-inner">
              <div className="preview-side">
                <div className="preview-dot-row">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="preview-menu-item active">
                  <span className="ic" />
                  Dasbor
                </div>
                <div className="preview-menu-item">
                  <span className="ic" />
                  Buku
                </div>
                <div className="preview-menu-item">
                  <span className="ic" />
                  Kategori
                </div>
                <div className="preview-menu-item">
                  <span className="ic" />
                  User
                </div>
              </div>
              <div className="preview-main">
                <div className="preview-cards">
                  <div className="preview-stat">
                    <b>1.284</b>
                    <span>TOTAL BUKU</span>
                  </div>
                  <div className="preview-stat">
                    <b>18</b>
                    <span>KATEGORI</span>
                  </div>
                  <div className="preview-stat">
                    <b>642</b>
                    <span>USER</span>
                  </div>
                  <div className="preview-stat">
                    <b>37</b>
                    <span>DIPINJAM</span>
                  </div>
                </div>
                <div className="preview-table">
                  <div className="preview-row">
                    <span className="t">Laskar Pelangi</span>
                    <span>Andrea Hirata</span>
                    <span className="preview-badge">Tersedia</span>
                  </div>
                  <div className="preview-row">
                    <span className="t">Sapiens</span>
                    <span>Yuval N. Harari</span>
                    <span className="preview-badge">Tersedia</span>
                  </div>
                  <div className="preview-row">
                    <span className="t">Clean Code</span>
                    <span>Robert C. Martin</span>
                    <span className="preview-badge">Tersedia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-bg" id="fitur">
        <div className="wrap">
          <div className="section-head">
            <h2>Semua yang dibutuhkan pustakawan</h2>
            <p>
              Empat modul inti yang saling terhubung, dirancang agar pekerjaan
              sehari-hari jadi lebih cepat.
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="9" rx="1.5" />
                  <rect x="14" y="3" width="7" height="5" rx="1.5" />
                  <rect x="14" y="12" width="7" height="9" rx="1.5" />
                  <rect x="3" y="16" width="7" height="5" rx="1.5" />
                </svg>
              </div>
              <h3>Ringkasan dasbor</h3>
              <p>
                Pantau jumlah koleksi, peminjaman, dan aktivitas terbaru dalam
                satu tampilan.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3>Manajemen buku</h3>
              <p>
                Tambah, ubah, dan lacak status ketersediaan setiap judul dengan
                pencarian cepat.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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
              <h3>Kategori terstruktur</h3>
              <p>
                Kelompokkan koleksi agar anggota lebih mudah menemukan buku yang
                dicari.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Data anggota & staf</h3>
              <p>
                Kelola peran admin, staf, dan anggota beserta status
                keanggotaannya.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="cara-kerja">
        <div className="wrap">
          <div className="section-head">
            <h2>Mulai dalam tiga langkah</h2>
            <p>
              Tidak perlu instalasi rumit — buat akun dan perpustakaan Anda siap
              dikelola hari ini.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h4>Buat akun</h4>
              <p>
                Daftar dengan email dalam kurang dari satu menit, tanpa kartu
                kredit.
              </p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h4>Masukkan koleksi</h4>
              <p>
                Tambahkan judul buku beserta kategori dan jumlah stok yang
                dimiliki.
              </p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h4>Kelola tiap hari</h4>
              <p>
                Pantau peminjaman, tambahkan anggota baru, dan lihat semuanya
                dari dasbor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-bg" id="tentang">
        <div className="cta-banner">
          <div>
            <h3>Siap merapikan perpustakaan Anda?</h3>
            <p>
              Gratis untuk perpustakaan kecil dan komunitas. Tidak perlu kartu
              kredit.
            </p>
          </div>
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              Buka Dashboard
            </Link>
          ) : (
            <Link href="/register" className="btn btn-primary btn-lg">
              Daftar sekarang
            </Link>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="brand">
                <span className="brand-mark">
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
                </span>
                Pustaka.id
              </div>
              <p>
                Aplikasi manajemen perpustakaan untuk sekolah, kampus, dan
                komunitas.
              </p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <h5>Produk</h5>
                <a href="#fitur">Fitur</a>
                <a href="#cara-kerja">Cara kerja</a>
                {!isAuthenticated && <Link href="/login">Masuk</Link>}
              </div>
              <div className="footer-col">
                <h5>Akun</h5>
                {isAuthenticated ? (
                  <Link href="/dashboard">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/register">Daftar</Link>
                    <Link href="/login">Masuk</Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              &copy; {new Date().getFullYear()} <strong>Dimenzi Studio</strong>.
              Seluruh hak cipta dilindungi.
            </span>
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              Dibuat dengan{" "}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="#d93636"
                stroke="#d93636"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2.08C10.5 3.5 9.5 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>{" "}
              untuk pustakawan Indonesia
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
