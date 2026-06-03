"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DentistOption { id: string; name: string; }

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0") + ":00"
);

function TimeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="flex-1 min-w-0 text-sm h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-52">
        {HOURS.map((h) => (
          <SelectItem key={h} value={h}>{h}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface DayHours {
  dayOfWeek: number;
  label: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
}

export function WorkingHoursEditor({ dentists }: { dentists: DentistOption[] }) {
  const queryClient = useQueryClient();
  const [dentistId, setDentistId] = useState(dentists[0]?.id ?? "");
  const [local, setLocal] = useState<DayHours[]>([]);

  const { data, isPending } = useQuery<DayHours[]>({
    queryKey: ["working-hours", dentistId],
    queryFn: async () => {
      const res = await fetch(`/api/working-hours?dentistId=${dentistId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!dentistId,
  });

  // Sync local state when data loads or dentist changes
  useEffect(() => {
    if (data) setLocal(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/working-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dentistId, hours: local }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours", dentistId] });
      toast.success("Radno vrijeme sačuvano.");
    },
    onError: () => toast.error("Greška pri čuvanju."),
  });

  function updateDay(dayOfWeek: number, field: keyof DayHours, value: string | boolean) {
    setLocal((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
  }

  return (
    <div className="space-y-4">
      {/* Doctor selector */}
      <div className="flex items-center gap-3">
        <Select value={dentistId} onValueChange={setDentistId}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Izaberi doktora" />
          </SelectTrigger>
          <SelectContent>
            {dentists.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Days grid */}
      {isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {local.map((day) => (
            <div
              key={day.dayOfWeek}
              className={cn(
                "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 p-3 rounded-lg border transition-colors",
                day.isActive ? "border-border bg-card" : "border-dashed border-border/50 bg-muted/30"
              )}
            >
              {/* Toggle + label — always a single horizontal line */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => updateDay(day.dayOfWeek, "isActive", !day.isActive)}
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors flex-shrink-0 relative",
                    day.isActive ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                      day.isActive ? "left-5" : "left-1"
                    )}
                  />
                </button>
                <span className={cn(
                  "w-24 text-sm font-medium",
                  !day.isActive && "text-muted-foreground"
                )}>
                  {day.label}
                </span>
              </div>

              {/* Time inputs — second line on mobile, inline on sm+ */}
              {day.isActive ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <TimeSelect
                    value={day.startTime}
                    onChange={(v) => updateDay(day.dayOfWeek, "startTime", v)}
                  />
                  <span className="text-muted-foreground text-sm flex-shrink-0">—</span>
                  <TimeSelect
                    value={day.endTime}
                    onChange={(v) => updateDay(day.dayOfWeek, "endTime", v)}
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground italic">Ne radi</span>
              )}
            </div>
          ))}
        </div>
      )}

      <Button onClick={() => save.mutate()} disabled={save.isPending || isPending} size="sm">
        {save.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Čuvanje...</>
          : <><Save className="w-4 h-4" /> Sačuvaj radno vrijeme</>
        }
      </Button>
    </div>
  );
}
