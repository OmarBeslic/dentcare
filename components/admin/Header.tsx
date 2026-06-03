import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@prisma/client";

interface HeaderProps {
  title: string;
  user: { name: string; role: Role };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  DENTIST: "Stomatolog",
  ASSISTANT: "Asistent",
};

const roleBadgeVariant: Record<
  Role,
  "teal" | "info" | "warning"
> = {
  ADMIN: "teal",
  DENTIST: "info",
  ASSISTANT: "warning",
};

export function Header({ title, user }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium">{user.name}</span>
          <Badge variant={roleBadgeVariant[user.role]} className="text-xs">
            {roleLabel[user.role]}
          </Badge>
        </div>
        <Avatar className="w-9 h-9">
          <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
