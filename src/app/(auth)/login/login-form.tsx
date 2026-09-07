"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/modules/auth/actions/login";

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    // Frontend validation ringan untuk UX
    const errors: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Masukkan alamat email yang valid.";
    if (!password) errors.password = "Kata sandi wajib diisi.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const result = await loginAction({ email, password });
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // Server validation / auth error
        if (result.error.code === "VALIDATION_ERROR" && (result.error as any).details) {
          const details = (result.error as any).details as { fieldErrors?: Record<string, string[]> };
          if (details.fieldErrors) {
            const fe: Record<string, string> = {};
            for (const [k, v] of Object.entries(details.fieldErrors)) {
              if (v && v[0]) fe[k] = v[0];
            }
            setFieldErrors(fe);
          }
        } else {
          setServerError(result.error.message);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div style={{ background: "#fdeaea", color: "#d93636", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          {serverError}
        </div>
      )}
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
          <input id="password" type={showPassword ? "text" : "password"} placeholder="Masukkan kata sandi" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <button type="button" className="toggle-pass" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
        </div>
        {fieldErrors.password && <div className="field-error" style={{ display: "block" }}>{fieldErrors.password}</div>}
      </div>

      <div className="row-between">
        <label className="checkbox-line"><input type="checkbox" /> Ingat saya</label>
        <a href="#" className="link-primary">Lupa kata sandi?</a>
      </div>

      <button type="submit" className="btn" disabled={isPending}>
        {isPending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
