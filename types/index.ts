import type {
  User,
  Patient,
  Appointment,
  Clinic,
  ToothRecord,
  PatientToothChart,
  Role,
  AppointmentStatus,
} from "@prisma/client";
import type { AssistantRestrictions } from "@/lib/permissions";

export type {
  User,
  Patient,
  Appointment,
  Clinic,
  ToothRecord,
  PatientToothChart,
  Role,
  AppointmentStatus,
  AssistantRestrictions,
};

export type AppointmentWithRelations = Appointment & {
  patient: Pick<Patient, "id" | "firstName" | "lastName" | "phone">;
  dentist: Pick<User, "id" | "name" | "email">;
  bookedBy: Pick<User, "id" | "name"> | null;
};

export type ToothCondition = "healthy" | "caries" | "missing" | "crown" | "implant" | "treated";

// GET /api/tooth-chart/[patientId]
export interface ToothChartResponse {
  chartData: Record<string, ToothCondition>;
  treatedTeeth: number[];
}

// Serialized (JSON) shape of a ToothRecord as returned by /api/tooth-records.
// price/isPaid are stripped server-side for ASSISTANT users when financials are restricted.
export interface ToothRecordDTO {
  id: string;
  patientId: string;
  clinicId: string;
  dentistId: string;
  treatedTeeth: number[];
  visitDate: string;
  diagnosis: string | null;
  serviceType: string;
  price?: string | number;
  isPaid?: boolean;
  notes: string | null;
  doctorSignature: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicDTO {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  assistantRestrictions: AssistantRestrictions;
  createdAt: string;
  updatedAt: string;
}
