import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { addMinutes } from "@/lib/utils";
import { startOfDay, endOfDay } from "date-fns";
import { getEffectiveClinicId } from "@/lib/clinic-scope";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { role, id: userId, clinicId } = session.user;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const dentistId = searchParams.get("dentistId");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const where: Record<string, unknown> = {};

  if (date) {
    const d = new Date(date);
    where.startTime = { gte: startOfDay(d), lte: endOfDay(d) };
  }
  if (status && status !== "ALL") where.status = status;

  // Role-based scoping — a DENTIST is always pinned to their own
  // appointments regardless of the dentistId query param; ASSISTANT is
  // confined to their own clinic; ADMIN follows the ClinicSwitcher
  // selection (or sees every clinic when "Sve klinike" is chosen) and may
  // additionally filter by dentist.
  if (role === "DENTIST") {
    where.dentistId = userId;
    if (clinicId) where.clinicId = clinicId;
  } else if (role === "ASSISTANT") {
    if (clinicId) where.clinicId = clinicId;
    if (dentistId) where.dentistId = dentistId;
  } else {
    const effectiveClinicId = await getEffectiveClinicId(role, clinicId);
    if (effectiveClinicId) where.clinicId = effectiveClinicId;
    if (dentistId) where.dentistId = dentistId;
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        dentist: { select: { id: true, name: true, email: true } },
        bookedBy: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.appointment.count({ where }),
  ]);

  return NextResponse.json({ appointments, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const effectiveClinicId = await getEffectiveClinicId(session.user.role, session.user.clinicId);
  if (!effectiveClinicId) {
    return NextResponse.json(
      { error: "Izaberite kliniku prije zakazivanja termina." },
      { status: 400 }
    );
  }
  const clinicId = effectiveClinicId;

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { patientId, dentistId, startTime, duration, type, notes } = parsed.data;

  // Patient and dentist must belong to the clinic being booked into
  const [patient, dentist] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId }, select: { clinicId: true } }),
    prisma.user.findUnique({ where: { id: dentistId }, select: { clinicId: true } }),
  ]);
  if (!patient || patient.clinicId !== clinicId || !dentist || dentist.clinicId !== clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const start = new Date(startTime);
  const end = addMinutes(start, duration);

  // Check conflict
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
      { error: "Termin je zauzet. Odaberite drugo vrijeme." },
      { status: 409 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      clinicId,
      patientId,
      dentistId,
      bookedById: session.user.id,
      startTime: start,
      endTime: end,
      duration,
      type,
      notes,
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      dentist: { select: { id: true, name: true, email: true } },
      bookedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}
