import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { statusLabel, statusVariant } from "@/lib/appointment-constants";
import type { AppointmentStatus } from "@/types";

interface Appointment {
  id: string;
  startTime: Date;
  type: string | null;
  duration: number;
  status: AppointmentStatus;
  dentist: { name: string };
}

interface Props {
  appointments: Appointment[];
}

export function PatientAppointmentHistory({ appointments }: Props) {
  if (appointments.length === 0) {
    return <EmptyState icon={Clock} message="Nema zakazanih termina." />;
  }

  return (
    <div className="space-y-2">
      {appointments.map((a) => (
        <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-primary w-24 flex-shrink-0">
              {formatDate(a.startTime)} {formatTime(a.startTime)}
            </div>
            <div>
              <p className="text-sm">{a.type ?? "Opšti pregled"}</p>
              <p className="text-xs text-muted-foreground">{a.dentist.name} · {a.duration} min</p>
            </div>
          </div>
          <Badge variant={statusVariant[a.status]}>{statusLabel[a.status]}</Badge>
        </div>
      ))}
    </div>
  );
}
