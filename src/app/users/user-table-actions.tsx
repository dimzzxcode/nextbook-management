"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRoleAction } from "@/modules/users/actions/user.actions";

const ROLES = ["ADMIN", "STAFF", "USER"] as const;

export default function UserTableActions({ user, currentUserId }: { user: { id: number; roleName: string }; currentUserId?: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState(user.roleName);

  const isSelf = currentUserId === user.id;

  const handleChange = () => {
    if (selected === user.roleName) return;
    if (isSelf) { setErr("Tidak dapat mengubah role sendiri."); setTimeout(()=>setErr(null),3000); return; }
    if (!confirm(`Ubah role "${user.roleName}" menjadi "${selected}"?`)) return;
    setErr(null);
    start(async () => {
      // Cari roleId dari nama (butuh mapping, kita fetch via hardcoded: ADMIN 1, STAFF 2, USER 3 sesuai seed)
      const map: Record<string, number> = { ADMIN: 1, STAFF: 2, USER: 3 };
      const roleId = map[selected];
      const res = await updateUserRoleAction({ id: user.id, roleId });
      if (res.success) router.refresh();
      else { setErr(res.error.message); setTimeout(()=>setErr(null),3000); }
    });
  };

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
      <select value={selected} onChange={(e) => setSelected(e.target.value)} disabled={pending || isSelf} style={{ height: 32, border: "1px solid var(--border)", borderRadius: 6, background: isSelf ? "var(--bg)" : "var(--white)", padding: "0 8px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", opacity: isSelf ? 0.6 : 1 }}>
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <button onClick={handleChange} disabled={pending || isSelf || selected === user.roleName} title={isSelf ? "Tidak dapat ubah diri sendiri" : "Ubah role"} style={{ height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--white)", color: "var(--primary)", fontSize: 12, fontWeight: 600, opacity: pending || isSelf || selected === user.roleName ? 0.5 : 1, cursor: pending || isSelf ? "not-allowed" : "pointer" }}>
        {pending ? "..." : "Ubah"}
      </button>
      {err && <span style={{ fontSize: 11, color: "#d93636", marginLeft: 4, maxWidth: 120, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={err}>{err}</span>}
    </div>
  );
}
