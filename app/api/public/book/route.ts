import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicBookingSchema } from "@/lib/validations";
import { addMinutes } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "booking");
  if (limited) return limited;

  const body = await req.json();
  const parsed = publicBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { firstName, lastName, phone, type, dentistId, startTime, duration, message } = parsed.data;

  // Verify dentist exists
  const dentist = await prisma.user.findFirst({
    where: { id: dentistId, role: { in: ["ADMIN", "DENTIST"] } },
  });
  if (!dentist) {
    return NextResponse.json({ error: "Izabrani doktor nije dostupan." }, { status: 400 });
  }

  const start = new Date(startTime);
  const end = addMinutes(start, duration);

  // Conflict check
  const conflict = await prisma.appointment.findFirst({
    where: {
      dentistId,
      status: { not: "CANCELLED" },
      OR: [
        { startTime: { lte: start }, endTime: { gt: start } },
        { startTime: { lt: end }, endTime: { gte: end } },
        { startTime: { gte: start }, endTime: { lte: end } },
      ],
    },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "Izabrani termin više nije dostupan. Molimo odaberite drugi." },
      { status: 409 }
    );
  }

  // Find or create patient by phone
  let patient = await prisma.patient.findFirst({ where: { phone } });
  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        phone,
        dateOfBirth: new Date("1990-01-01"),
        jmbg: `00000000000${Date.now().toString().slice(-2)}`.slice(0, 13),
        notes: "Zahtev sa sajta",
      },
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      dentistId,
      startTime: start,
      endTime: end,
      duration,
      type,
      notes: message,
    },
    include: { dentist: { select: { name: true } } },
  });

  return NextResponse.json(
    {
      success: true,
      appointmentId: appointment.id,
      dentistName: appointment.dentist.name,
      startTime: appointment.startTime,
      message: "Vaš termin je uspješno zakazan!",
    },
    { status: 201 }
  );
}
