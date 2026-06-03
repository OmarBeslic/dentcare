import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAY_LABELS = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dentistId = new URL(req.url).searchParams.get("dentistId");
  if (!dentistId) return NextResponse.json({ error: "dentistId required" }, { status: 400 });

  const rows = await prisma.workingHours.findMany({
    where: { userId: dentistId },
    orderBy: { dayOfWeek: "asc" },
  });

  // Return all 7 days, filling in defaults for missing rows
  const result = [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const row = rows.find((r) => r.dayOfWeek === day);
    return {
      dayOfWeek: day,
      label: DAY_LABELS[day],
      isActive: row ? row.isActive : day >= 1 && day <= 5,
      startTime: row?.startTime ?? "08:00",
      endTime: row?.endTime ?? "16:00",
    };
  });

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { dentistId, hours } = await req.json();
  if (!dentistId || !Array.isArray(hours)) {
    return NextResponse.json({ error: "dentistId and hours[] required" }, { status: 400 });
  }

  await Promise.all(
    hours.map((h: { dayOfWeek: number; isActive: boolean; startTime: string; endTime: string }) =>
      prisma.workingHours.upsert({
        where: { userId_dayOfWeek: { userId: dentistId, dayOfWeek: h.dayOfWeek } },
        update: { isActive: h.isActive, startTime: h.startTime, endTime: h.endTime },
        create: {
          userId: dentistId,
          dayOfWeek: h.dayOfWeek,
          isActive: h.isActive,
          startTime: h.startTime,
          endTime: h.endTime,
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
