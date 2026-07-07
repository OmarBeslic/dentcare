import { Globe, UserCheck } from "lucide-react";

interface Props {
  bookedBy: { name: string } | null;
}

export function BookedByBadge({ bookedBy }: Props) {
  if (bookedBy) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium">
        <UserCheck className="w-3 h-3" />{bookedBy.name}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
      <Globe className="w-3 h-3" />Online
    </span>
  );
}
