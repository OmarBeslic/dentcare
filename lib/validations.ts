import { z } from "zod";

const jmbgSchema = z
  .string()
  .length(13, "JMBG mora imati tačno 13 cifara")
  .regex(/^\d{13}$/, "JMBG sme sadržati samo cifre")
  .refine((jmbg) => {
    const weights = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    const digits = jmbg.split("").map(Number);
    const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
    const remainder = 11 - (sum % 11);
    const checkDigit = remainder > 9 ? 0 : remainder;
    return checkDigit === digits[12];
  }, "JMBG nije validan (neispravan kontrolni broj)");

export const patientSchema = z.object({
  firstName: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  lastName: z.string().min(2, "Prezime mora imati najmanje 2 karaktera"),
  dateOfBirth: z.string().min(1, "Datum rodjenja je obavezan"),
  jmbg: jmbgSchema,
  phone: z.string().min(6, "Telefon nije validan"),
  notes: z.string().optional(),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Pacijent je obavezan"),
  dentistId: z.string().min(1, "Doktor je obavezan"),
  startTime: z.string().min(1, "Vrijeme početka je obavezno"),
  duration: z.coerce.number().refine((v) => [15, 30, 60, 90, 120].includes(v), {
    message: "Trajanje mora biti 15, 30, 60, 90 ili 120 minuta",
  }),
  type: z.string().optional(),
  notes: z.string().optional(),
});

export const recordSchema = z.object({
  visitDate: z.string().min(1, "Datum posete je obavezan"),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  toothChart: z.record(z.string(), z.string()).optional(),
});

export const userSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  email: z.string().email("Email nije validan"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
  role: z.enum(["ADMIN", "DENTIST", "ASSISTANT"]),
});

export const createClinicSchema = z.object({
  name: z.string().min(2, "Naziv klinike mora imati najmanje 2 karaktera"),
});

export const updateClinicSchema = z.object({
  name: z.string().min(2, "Naziv klinike mora imati najmanje 2 karaktera").optional(),
  isActive: z.boolean().optional(),
});

export const toothRecordSchema = z.object({
  patientId: z.string().min(1, "Pacijent je obavezan"),
  treatedTeeth: z
    .array(z.coerce.number().int())
    .min(1, "Izaberite bar jedan zub"),
  diagnosis: z.string().optional(),
  serviceType: z.string().min(1, "Tip usluge je obavezan"),
  price: z.coerce.number().min(0).default(0),
  isPaid: z.boolean().default(false),
  notes: z.string().optional(),
  visitDate: z.string().min(1, "Datum posete je obavezan"),
});

export const toothRecordUpdateSchema = toothRecordSchema
  .omit({ patientId: true })
  .partial();

export const toothChartUpdateSchema = z.object({
  toothNumber: z.coerce.number().int(),
  condition: z.enum(["healthy", "caries", "missing", "crown", "implant", "treated"]),
});

export const assistantRestrictionsSchema = z.object({
  financials: z.boolean().optional(),
  diagnosis: z.boolean().optional(),
  patientNotes: z.boolean().optional(),
  jmbg: z.boolean().optional(),
});

