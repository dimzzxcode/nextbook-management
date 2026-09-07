import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <>
      <style>{`
        *{box-sizing:border-box}*,*::before,*::after{box-sizing:border-box}html,body{height:100%}body{margin:0;font-family:"Plus Jakarta Sans",system-ui,-apple-system,sans-serif;background:var(--white);color:var(--text);font-size:14.5px;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}button{font-family:inherit;cursor:pointer}:focus-visible{outline:2px solid var(--primary);outline-offset:2px}:root{--white:#ffffff;--bg:#f3f6fb;--primary:#2563eb;--primary-600:#1d4ed8;--primary-50:#eff6ff;--primary-100:#dbeafe;--text:#0f172a;--text-muted:#64748b;--text-light:#94a3b8;--border:#e3e8f0;--danger-bg:#fdeaea;--danger-text:#d93636;--radius-sm:8px;--radius-md:12px}.screen{display:grid;grid-template-columns:1fr;min-height:100vh}@media(min-width:900px){.screen{grid-template-columns:1fr 1fr}}.brand-panel{display:none;background:var(--primary);padding:48px;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;color:var(--white)}@media(min-width:900px){.brand-panel{display:flex}}.brand-panel::before{content:"";position:absolute;bottom:-160px;left:-140px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)}.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:17px;position:relative;z-index:1;color:var(--white)}.brand-mark{width:34px;height:34px;border-radius:9px;background:var(--white);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(15,23,42,0.12)}.brand-visual{position:relative;z-index:1}.brand-visual h2{font-size:27px;font-weight:800;letter-spacing:-0.02em;line-height:1.25;margin:0 0 14px;max-width:380px;color:var(--white)}.brand-visual p{color:rgba(255,255,255,0.85);max-width:360px;margin:0;font-size:14.5px}.mini-preview{margin-top:32px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--white);padding:16px;box-shadow:0 4px 12px rgba(15,23,42,0.08)}.mini-preview .row{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:8px}.mini-preview .row:last-child{margin-bottom:0}.mini-preview .row .avatar{width:26px;height:26px;border-radius:50%;background:var(--primary);color:#ffffff !important;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}.mini-preview .row .txt{flex:1}.mini-preview .row .txt b{display:block;font-size:12px;font-weight:700;color:var(--text)}.mini-preview .row .txt span{font-size:10.5px;color:var(--text-muted) !important}.mini-preview .row .badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;background:#e3faec;color:#0f9d58;border:1px solid #b7f0d0}            .brand-quote{position:relative;z-index:1;font-size:12.5px;color:rgba(255,255,255,0.8)}.brand-quote strong{color:var(--white)}.form-panel{display:flex;align-items:center;justify-content:center;padding:32px 24px}.form-card{width:100%;max-width:380px}.form-brand-mobile{display:flex;align-items:center;gap:10px;font-weight:800;font-size:16px;margin-bottom:36px}@media(min-width:900px){.form-brand-mobile{display:none}}.form-card h1{font-size:24px;font-weight:800;letter-spacing:-0.01em;margin:0 0 8px}.form-card>p.sub{color:var(--text-muted);margin:0 0 28px;font-size:14px}.field{margin-bottom:16px}.field label{display:block;font-size:13px;font-weight:600;margin-bottom:7px}.input-wrap{position:relative}.input-wrap svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--text-light)}.input-wrap input{width:100%;height:44px;padding:0 14px 0 40px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;color:var(--text);outline:none;transition:border-color 150ms ease;font-family:inherit}.input-wrap input:focus{border-color:var(--primary)}.input-wrap .toggle-pass{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:32px;height:32px;border:none;background:transparent;color:var(--text-light);display:flex;align-items:center;justify-content:center;border-radius:6px}.input-wrap .toggle-pass:hover{color:var(--primary);background:var(--primary-50)}.field-error{font-size:12px;color:var(--danger-text);margin-top:6px}.field.has-error input{border-color:var(--danger-text)}.row-between{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;font-size:13px}.checkbox-line{display:flex;align-items:center;gap:8px;color:var(--text-muted);cursor:pointer}.checkbox-line input{width:16px;height:16px;accent-color:var(--primary)}.link-primary{color:var(--primary);font-weight:600}.link-primary:hover{color:var(--primary-600);text-decoration:underline}.btn{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:var(--radius-sm);font-size:14.5px;font-weight:700;border:none;background:var(--primary);color:var(--white);transition:background 150ms ease}.btn:hover{background:var(--primary-600)}.btn:disabled{opacity:0.6;cursor:not-allowed}.divider{display:flex;align-items:center;gap:12px;margin:24px 0;color:var(--text-light);font-size:12.5px}.divider::before,.divider::after{content:"";flex:1;height:1px;background:var(--border)}.btn-social{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:11px 16px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--white);font-size:13.5px;font-weight:600;color:var(--text);margin-bottom:10px;transition:border-color 150ms ease,background 150ms ease}.btn-social:hover{border-color:var(--primary-100);background:var(--primary-50)}.foot-note{text-align:center;margin-top:28px;font-size:13.5px;color:var(--text-muted)}.toast{position:fixed;bottom:20px;right:20px;background:var(--text);color:var(--white);padding:12px 16px;border-radius:var(--radius-sm);font-size:13px;display:flex;gap:10px;align-items:center;box-shadow:0 12px 32px -8px rgba(15,23,42,0.3)}
      `}</style>
      <div className="screen">
        <aside className="brand-panel">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
            </span>
            Pustaka.id
          </Link>
          <div className="brand-visual">
            <h2>Semua koleksi perpustakaan Anda, dalam satu dasbor.</h2>
            <p>Masuk untuk melanjutkan mengelola buku, kategori, dan anggota perpustakaan Anda.</p>
            <div className="mini-preview">
              <div className="row"><span className="avatar">LP</span><span className="txt"><b>Laskar Pelangi</b><span>Andrea Hirata</span></span><span className="badge">Tersedia</span></div>
              <div className="row"><span className="avatar">AH</span><span className="txt"><b>Atomic Habits</b><span>James Clear</span></span><span className="badge">Tersedia</span></div>
            </div>
          </div>
          <p className="brand-quote"><strong>5.200+ pustakawan</strong> sudah mengelola koleksinya dengan Pustaka.</p>
        </aside>
        <section className="form-panel">
          <div className="form-card">
            <Link href="/" className="form-brand-mobile">
              <span className="brand-mark"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></span>Pustaka.id</Link>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)", marginBottom: 16, textDecoration: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
              Kembali ke Beranda
            </Link>
            <h1>Masuk ke akun Anda</h1>
            <p className="sub">Kelola koleksi perpustakaan Anda dari mana saja.</p>
            <LoginForm />
            <p className="foot-note">Belum punya akun? <Link href="/register" className="link-primary">Daftar sekarang</Link></p>
          </div>
        </section>
      </div>
    </>
  );
}
