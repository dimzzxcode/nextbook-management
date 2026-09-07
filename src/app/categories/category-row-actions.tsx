"use client";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "@/modules/categories/actions/category.actions";

export default function CategoryRowActions({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const handleDelete = () => {
    if (!confirm(`Hapus kategori "${name}"? Kategori yang dipakai buku tidak bisa dihapus.`)) return;
    setErr(null);
    start(async () => {
      const res = await deleteCategoryAction(id);
      if (res.success) router.refresh();
      else {
        setErr(res.error.message);
        setTimeout(() => setErr(null), 3000);
      }
    });
  };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <button onClick={handleDelete} disabled={pending} className="btn btn-ghost" style={{ flex: 1, fontSize: 12, padding: "6px 10px", color: "var(--danger-text)", borderColor: pending ? "var(--border)" : "var(--danger-bg)", opacity: pending ? 0.6 : 1 }}>
        {pending ? "..." : "Hapus"}
      </button>
      {err && <span style={{ fontSize: 11, color: "#d93636" }}>{err}</span>}
    </div>
  );
}
