import { requireAuth } from "@/modules/auth/services/require-auth";
import DashboardShell from "../dashboard/dashboard-shell";

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  let user: { name: string; email: string; role: string } | null = null;
  try {
    const u = await requireAuth();
    user = { name: u.name, email: u.email, role: u.role };
  } catch {
    user = { name: "Guest", email: "", role: "USER" };
  }
  return <DashboardShell user={user!}>{children}</DashboardShell>;
}
