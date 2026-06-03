import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { MobileNav } from "@/components/admin/MobileNav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
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
