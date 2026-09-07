import { requireAuth } from "@/modules/auth/services/require-auth";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const user = await requireAuth();
  return (
    <>
      <div className="section-head">
        <div>
          <h2>Profile</h2>
          <p>Kelola informasi akun Anda</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 640, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "var(--primary-50)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Informasi Akun</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              Perbarui data profil Anda
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div
            style={{
              background: "#fbfdff",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 50,
                background: "var(--primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                  transform: "translateY(0.5px)",
                }}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </span>
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16v16H4z" opacity="0" />
                  <path d="M22 6c0-1.1-.9-2-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6Z" />
                  <path d="m2 7 8.97 6.16a2 2 0 0 0 2.06 0L22 7" />
                </svg>
                {user.email}
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1px 6px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  marginTop: 4,
                  background:
                    user.role === "ADMIN"
                      ? "#eff6ff"
                      : user.role === "STAFF"
                        ? "#e3faec"
                        : "#f3f6fb",
                  color:
                    user.role === "ADMIN"
                      ? "#2563eb"
                      : user.role === "STAFF"
                        ? "#0f9d58"
                        : "#64748b",
                  border: `1px solid ${user.role === "ADMIN" ? "#dbeafe" : user.role === "STAFF" ? "#b7f0d0" : "#e3e8f0"}`,
                }}
              >
                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
              </span>
            </div>
          </div>

          <ProfileForm initialName={user.name} />
        </div>
      </div>
    </>
  );
}
