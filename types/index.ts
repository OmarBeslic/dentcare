import type {
  User,
  Patient,
  Appointment,
  PatientRecord,
  Role,
  AppointmentStatus,
} from "@prisma/client";

export type { User, Patient, Appointment, PatientRecord, Role, AppointmentStatus };

export type AppointmentWithRelations = Appointment & {
  patient: Pick<Patient, "id" | "firstName" | "lastName" | "phone">;
  dentist: Pick<User, "id" | "name" | "email">;
  bookedBy: Pick<User, "id" | "name"> | null;
};

export type PatientWithStats = Patient & {
  _count: { appointments: number; records: number };
  appointments: AppointmentWithRelations[];
};

export type RecordWithRelations = PatientRecord & {
  createdBy: Pick<User, "id" | "name">;
};

export type ToothState = "healthy" | "caries" | "missing" | "crown" | "implant";
export type ToothChart = Record<string, ToothState>;
