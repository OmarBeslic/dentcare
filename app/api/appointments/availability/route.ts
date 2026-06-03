import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { generateSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dentistId = searchParams.get("dentistId");
  const date = searchParams.get("date");
  const duration = parseInt(searchParams.get("duration") ?? "30");

  if (!dentistId || !date) {
    return NextResponse.json({ error: "dentistId and date are required" }, { status: 400 });
  }

  const d = new Date(date);
  const dayOfWeek = d.getDay();

  const [workingHours, appointments] = await Promise.all([
    prisma.workingHours.findUnique({
      where: { userId_dayOfWeek: { userId: dentistId, dayOfWeek } },
    }),
    prisma.appointment.findMany({
      where: {
        dentistId,
        status: { not: "CANCELLED" },
        startTime: { gte: startOfDay(d), lte: endOfDay(d) },
      },
      select: { startTime: true, endTime: true },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const workingDay = workingHours ?? {
    isActive: true,
    startTime: "08:00",
    endTime: "16:00",
  };

  const { slots, offDay } = generateSlots(d, duration, workingDay, appointments);

  if (offDay) {
    return NextResponse.json({ slots: [], offDay: true, message: "Doktor ne radi tog dana" });
  }

  return NextResponse.json({ slots });
}
