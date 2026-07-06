"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { ClinicSwitcher } from "@/components/admin/ClinicSwitcher";
import type { AppRole } from "@/types/next-auth";

interface HeaderProps {
  title: string;
  user: { name: string; role: AppRole };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleLabel: Record<AppRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  DENTIST: "Stomatolog",
  ASSISTANT: "Asistent",
};

const roleBadgeVariant: Record<
  AppRole,
  "teal" | "info" | "warning" | "gold"
> = {
  SUPER_ADMIN: "gold",
  ADMIN: "teal",
  DENTIST: "info",
  ASSISTANT: "warning",
};

export function Header({ title, user }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
      <div className="flex items-center gap-3">
        {user.role === "ADMIN" && <ClinicSwitcher />}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium">{user.name}</span>
          <Badge variant={roleBadgeVariant[user.role]} className="text-xs">
            {roleLabel[user.role]}
          </Badge>
        </div>
        <Avatar className="w-9 h-9">
          <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
          aria-label="Odjava"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
