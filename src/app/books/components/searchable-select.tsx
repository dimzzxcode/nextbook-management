"use client";

import { useState, useRef, useEffect, useMemo } from "react";

type Option = { id: number; name: string };

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Pilih...",
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => options.find((o) => String(o.id) === value), [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 50);
    return options.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 50);
  }, [options, query]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          height: 40,
          padding: "0 12px",
          border: "1px solid var(--border)",
          borderRadius: 6,
          background: "var(--white)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          color: selected ? "var(--text)" : "var(--text-light)",
          textAlign: "left",
        }}
      >
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selected ? selected.name : placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--white)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 12px 32px -8px rgba(15,23,42,0.18)", zIndex: 50, overflow: "hidden" }}>
          <div style={{ padding: 8, borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px", height: 36 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: "var(--text-light)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                autoFocus
                placeholder={`Cari ${label.toLowerCase()}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13 }}
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-light)", display: "flex" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            <button type="button" onClick={() => { onChange(""); setOpen(false); setQuery(""); }} style={{ width: "100%", textAlign: "left", padding: "10px 12px", border: "none", background: !value ? "var(--primary-50)" : "transparent", color: !value ? "var(--primary)" : "var(--text)", fontSize: 13, fontWeight: !value ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{placeholder}</span>
              {!value && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
            </button>
            {filtered.length === 0 ? (
              <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Tidak ada hasil untuk &quot;{query}&quot;</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { onChange(String(o.id)); setOpen(false); setQuery(""); }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    border: "none",
                    background: String(o.id) === value ? "var(--primary-50)" : "transparent",
                    color: String(o.id) === value ? "var(--primary)" : "var(--text)",
                    fontSize: 13,
                    fontWeight: String(o.id) === value ? 600 : 400,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</span>
                  {String(o.id) === value && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
                </button>
              ))
            )}
          </div>

          <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-light)", background: "#f8fafc" }}>
            {filtered.length} dari {options.length} • Ketik untuk mencari
          </div>
        </div>
      )}
    </div>
  );
}
