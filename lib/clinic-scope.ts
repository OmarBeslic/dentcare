import { cookies } from "next/headers";
import type { AppRole } from "@/types/next-auth";

// ADMIN can see and manage every clinic's patient/appointment data via the
// ClinicSwitcher. SUPER_ADMIN is deliberately NOT included — their job is
// creating/activating clinics through /super-admin, not touching clinical
// data, so every clinical-data route must reject them explicitly rather
// than relying on this for a bypass. DENTIST/ASSISTANT are always pinned to
// their own clinic regardless of the switcher cookie.
export function isGlobalRole(role: AppRole): boolean {
  return role === "ADMIN";
}

// Resolves which single clinic a list/create query should be scoped to.
// Returns null to mean "all clinics" — only possible for ADMIN when the
// ClinicSwitcher has "Sve klinike" selected (or nothing selected yet).
// Callers must reject SUPER_ADMIN themselves before calling this — passing
// SUPER_ADMIN here returns null (their ownClinicId), which reads as "all
// clinics, unscoped" and is NOT a safe default for clinical-data routes.
export async function getEffectiveClinicId(
  role: AppRole,
  ownClinicId: string | null
): Promise<string | null> {
  if (!isGlobalRole(role)) return ownClinicId;

  const cookieStore = await cookies();
  const selected = cookieStore.get("selectedClinicId")?.value;
  return selected && selected !== "all" ? selected : null;
}
