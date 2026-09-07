"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAuthorAction } from "@/modules/authors/actions/author.actions";

export default function AuthorTableActions({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const handleDelete = () => {
    if (!confirm(`Hapus penulis "${name}"?`)) return;
    setErr(null);
    start(async () => {
      const res = await deleteAuthorAction(id);
      if (res.success) router.refresh();
      else { setErr(res.error.message); setTimeout(()=>setErr(null),3000); }
    });
  };
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
      <Link href={`/authors/${id}/edit`} title="Edit penulis" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--white)", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
      </Link>
      <button onClick={handleDelete} disabled={pending} title="Hapus penulis" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fde8e8", background: "var(--white)", color: "var(--danger-text)", display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: pending?0.6:1, cursor: pending?"not-allowed":"pointer" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
      </button>
      {err && <span style={{ fontSize: 11, color: "#d93636", marginLeft: 4 }}>{err}</span>}
    </div>
  );
}
