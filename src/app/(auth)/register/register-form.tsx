"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/modules/auth/actions/register";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const strengthLevel = (() => {
    let level = 0;
    if (password.length >= 8) level++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) level++;
    if (/[^A-Za-z0-9]/.test(password) && password.length >= 10) level++;
    return level;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Nama wajib diisi.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Masukkan alamat email yang valid.";
    if (password.length < 8) errors.password = "Kata sandi minimal 8 karakter.";
    if (confirmPassword !== password) errors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const result = await registerAction({ name, email, password, confirmPassword });
      if (result.success) {
        setServerSuccess("Akun berhasil dibuat. Mengalihkan ke halaman masuk...");
        setTimeout(() => router.push("/login"), 800);
      } else {
        if (result.error.code === "VALIDATION_ERROR" && (result.error as any).details) {
          const details = (result.error as any).details as { fieldErrors?: Record<string, string[]> };
          if (details.fieldErrors) {
            const fe: Record<string, string> = {};
            for (const [k, v] of Object.entries(details.fieldErrors)) if (v && v[0]) fe[k] = v[0];
            setFieldErrors(fe);
          } else {
            setServerError(result.error.message);
          }
        } else {
          setServerError(result.error.message);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div style={{ background: "#fdeaea", color: "#d93636", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{serverError}</div>}
      {serverSuccess && <div style={{ background: "#e3faec", color: "#0f9d58", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{serverSuccess}</div>}

      <div className={`field ${fieldErrors.name ? "has-error" : ""}`}>
        <label htmlFor="name">Nama lengkap</label>
        <div className="input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          <input id="name" type="text" placeholder="Nama Anda" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </div>
        {fieldErrors.name && <div className="field-error" style={{ display: "block" }}>{fieldErrors.name}</div>}
      </div>

      <div className={`field ${fieldErrors.email ? "has-error" : ""}`}>
        <label htmlFor="email">Email</label>
        <div className="input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 6c0-1.1-.9-2-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6Z" /><path d="m2 7 8.97 6.16a2 2 0 0 0 2.06 0L22 7" /></svg>
          <input id="email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        {fieldErrors.email && <div className="field-error" style={{ display: "block" }}>{fieldErrors.email}</div>}
      </div>

      <div className={`field ${fieldErrors.password ? "has-error" : ""}`}>
        <label htmlFor="password">Kata sandi</label>
        <div className="input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <input id="password" type={showPassword ? "text" : "password"} placeholder="Minimal 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          <button type="button" className="toggle-pass" onClick={() => setShowPassword((v) => !v)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg></button>
        </div>
        <div className={`strength-meter ${strengthLevel > 0 ? "level-" + strengthLevel : ""}`}><span /><span /><span /></div>
        {fieldErrors.password && <div className="field-error" style={{ display: "block" }}>{fieldErrors.password}</div>}
      </div>

      <div className={`field ${fieldErrors.confirmPassword ? "has-error" : ""}`}>
        <label htmlFor="confirmPassword">Konfirmasi kata sandi</label>
        <div className="input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Ulangi kata sandi" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        {fieldErrors.confirmPassword && <div className="field-error" style={{ display: "block" }}>{fieldErrors.confirmPassword}</div>}
      </div>

      <button type="submit" className="btn" disabled={isPending}>{isPending ? "Memproses..." : "Buat akun"}</button>
    </form>
  );
}
