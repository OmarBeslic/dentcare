import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";
import { addMinutes } from "@/lib/utils";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  if (dentistId) where.dentistId = dentistId;
  if (status && status !== "ALL") where.status = status;

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

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { patientId, dentistId, startTime, duration, type, notes } = parsed.data;
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
