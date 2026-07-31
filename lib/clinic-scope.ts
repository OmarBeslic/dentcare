import { cookies } from "next/headers";
import type { AppRole } from "@/types/next-auth";
import { prisma } from "./prisma";

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
  if (selected && selected !== "all") return selected;

  // No explicit selection (or "all clinics"). If there's genuinely only one
  // clinic, there's nothing to choose between — auto-resolve to it instead
  // of leaving effectiveClinicId null (the switcher itself is hidden in this
  // case, so the cookie could never otherwise get set).
  const clinics = await prisma.clinic.findMany({ select: { id: true }, take: 2 });
  if (clinics.length === 1) return clinics[0].id;

  return null;
}
