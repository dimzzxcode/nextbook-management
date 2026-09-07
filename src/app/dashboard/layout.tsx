import { requireAuth } from "@/modules/auth/services/require-auth";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: { name: string; email: string; role: string } | null = null;
  try {
    const u = await requireAuth();
    user = { name: u.name, email: u.email, role: u.role };
  } catch {
    // proxy will redirect, but for build we fallback
    user = { name: "Guest", email: "guest@example.com", role: "USER" };
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
