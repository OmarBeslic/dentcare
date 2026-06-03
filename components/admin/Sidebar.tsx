"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Role } from "@prisma/client";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Zakazivanja", icon: Calendar },
  { href: "/admin/patients", label: "Pacijenti", icon: Users },
];

interface SidebarProps {
  user: { name: string; email: string; role: Role };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleBadgeClass: Record<Role, string> = {
  ADMIN: "bg-primary-light text-primary",
  DENTIST: "bg-blue-100 text-blue-700",
  ASSISTANT: "bg-amber-100 text-amber-700",
};

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  DENTIST: "Stomatolog",
  ASSISTANT: "Asistent",
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-200 lg:w-60 md:w-16">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border h-16">
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <span className="font-display text-lg font-semibold text-primary hidden lg:block">
          DentCare
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary-light text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}

        {user.role === "ADMIN" && (
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              pathname.startsWith("/admin/settings")
                ? "bg-primary-light text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block">Podešavanja</span>
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="hidden lg:block min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <span
              className={cn(
                "inline-block text-xs px-1.5 py-0.5 rounded-full font-medium",
                roleBadgeClass[user.role]
              )}
            >
              {roleLabel[user.role]}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 mt-1"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="hidden lg:block">Odjava</span>
        </button>
      </div>
    </aside>
  );
}
