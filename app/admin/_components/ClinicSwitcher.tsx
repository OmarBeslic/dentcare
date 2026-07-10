"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClinics } from "@/hooks/useClinics";
import { setSelectedClinic } from "@/lib/clinic-actions";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function subscribeNoop() {
  return () => {};
}
function getCookieSnapshot() {
  return getCookie("selectedClinicId") ?? "all";
}
function getCookieServerSnapshot() {
  return "all";
}

export function ClinicSwitcher() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: clinics = [], isPending } = useClinics();
  // The cookie is the source of truth across reloads; pendingOverride reflects the
  // user's most recent click immediately, before the cookie write round-trips.
  const cookieValue = useSyncExternalStore(subscribeNoop, getCookieSnapshot, getCookieServerSnapshot);
  const [pendingOverride, setPendingOverride] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = pendingOverride ?? cookieValue;

  async function handleSelect(clinicId: string) {
    setPendingOverride(clinicId);
    setSaving(true);
    try {
      await setSelectedClinic(clinicId);
      // Every list/detail query (patients, appointments, users, tooth
      // records/chart, clinics/current...) is scoped to the selected clinic
      // server-side, so the entire client cache must be thrown away —
      // router.refresh() alone only re-runs Server Components.
      await queryClient.invalidateQueries();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (isPending && clinics.length === 0) return <Skeleton className="h-9 w-36" />;
  if (clinics.length < 2) return null;

  const currentLabel =
    selected === "all" ? "Sve klinike" : clinics.find((c) => c.id === selected)?.name ?? "Sve klinike";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={saving} className="gap-2">
          <Building2 className="w-4 h-4" />
          <span className="hidden sm:inline text-muted-foreground">Pregled:</span>
          {currentLabel}
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleSelect("all")}>
          {selected === "all" && <Check className="w-4 h-4 mr-2" />}
          <span className={selected !== "all" ? "ml-6" : ""}>Sve klinike</span>
        </DropdownMenuItem>
        {clinics.map((c) => (
          <DropdownMenuItem key={c.id} onClick={() => handleSelect(c.id)}>
            {selected === c.id && <Check className="w-4 h-4 mr-2" />}
            <span className={selected !== c.id ? "ml-6" : ""}>{c.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
