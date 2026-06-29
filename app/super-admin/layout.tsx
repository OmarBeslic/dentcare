import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <h1 className="text-lg font-semibold text-foreground">Super Admin Panel</h1>
        <LogoutButton />
      </header>
      <main className="p-4 lg:p-6">{children}</main>
    </div>
  );
}
