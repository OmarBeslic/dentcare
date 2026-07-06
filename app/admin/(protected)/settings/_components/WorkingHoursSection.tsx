import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { WorkingHoursEditor } from "./WorkingHoursEditor";
import type { User } from "@/hooks/useUsers";

interface Props {
  users: User[];
}

export function WorkingHoursSection({ users }: Props) {
  const dentistOptions = users.filter((u) => ["ADMIN", "DENTIST"].includes(u.role));
  if (dentistOptions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4" /> Radno vrijeme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WorkingHoursEditor dentists={dentistOptions} />
      </CardContent>
    </Card>
  );
}
