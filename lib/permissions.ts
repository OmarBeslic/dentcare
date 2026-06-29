import type { AppRole } from "@/types/next-auth";

export type DataScope = "all" | "clinic" | "own" | "none";

export interface RolePermissions {
  patients: DataScope;
  appointments: DataScope;
  financials: boolean;
  canManageStaff: boolean;
  canCreateClinics: boolean;
}

export const permissions: Record<AppRole, RolePermissions> = {
  // SUPER_ADMIN's job is creating/activating clinics via /super-admin — they
  // never touch clinical data. They can view a read-only staff list per
  // clinic there, but cannot add/edit/remove staff (that's ADMIN's job).
  SUPER_ADMIN: {
    patients: "none",
    appointments: "none",
    financials: false,
    canManageStaff: false,
    canCreateClinics: true,
  },
  ADMIN: {
    patients: "all",
    appointments: "all",
    financials: true,
    canManageStaff: true,
    canCreateClinics: false,
  },
  DENTIST: {
    patients: "own",
    appointments: "own",
    financials: true,
    canManageStaff: false,
    canCreateClinics: false,
  },
  ASSISTANT: {
    patients: "clinic",
    appointments: "clinic",
    financials: false,
    canManageStaff: false,
    canCreateClinics: false,
  },
};

export function getUserScope(role: AppRole): DataScope {
  return permissions[role].patients;
}

export interface AssistantRestrictions {
  financials?: boolean;
  diagnosis?: boolean;
  patientNotes?: boolean;
  jmbg?: boolean;
}
