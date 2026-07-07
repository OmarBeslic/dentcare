import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  message: string;
}

export function EmptyState({ icon: Icon, message }: Props) {
  return (
    <div className="text-center py-10 text-muted-foreground">
      <Icon className="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
