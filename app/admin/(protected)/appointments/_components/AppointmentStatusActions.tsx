"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import type { AppointmentStatus } from "@/types";

interface Props {
  status: AppointmentStatus;
  onComplete: () => void;
  onCancel: () => void;
  variant?: "table" | "card";
}

export function AppointmentStatusActions({ status, onComplete, onCancel, variant = "table" }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (status !== "SCHEDULED") return null;

  const isCard = variant === "card";

  return (
    <>
      <div className={isCard ? "flex gap-1" : "flex items-center justify-end gap-1"}>
        <Button
          size="sm"
          variant={isCard ? "outline" : "ghost"}
          className={isCard
            ? "h-7 px-2 text-success border-success/30"
            : "h-8 w-8 p-0 text-success hover:text-success hover:bg-green-50"}
          onClick={onComplete}
          title="Završi"
        >
          <Check className={isCard ? "w-3 h-3" : "w-4 h-4"} />
        </Button>
        <Button
          size="sm"
          variant={isCard ? "outline" : "ghost"}
          className={isCard
            ? "h-7 px-2 text-destructive border-destructive/30"
            : "h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50"}
          onClick={() => setConfirmOpen(true)}
          title="Otkaži"
        >
          <X className={isCard ? "w-3 h-3" : "w-4 h-4"} />
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Otkaži termin?"
        description="Jeste li sigurni da želite da otkažete ovaj termin?"
        confirmLabel="Otkaži termin"
        onConfirm={onCancel}
      />
    </>
  );
}
