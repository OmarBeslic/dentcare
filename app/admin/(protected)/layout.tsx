import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/app/admin/_components/Sidebar";
import { MobileNav } from "@/app/admin/_components/MobileNav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  // SUPER_ADMIN has no clinic and belongs in /super-admin, not the regular admin UI.
  if (session.user.role === "SUPER_ADMIN") {
    redirect("/super-admin");
  }

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    role: session.user.role,
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      <MobileNav role={user.role} />
      <main className="md:ml-16 lg:ml-60 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
