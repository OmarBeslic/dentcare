import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toothRecordUpdateSchema } from "@/lib/validations";
import { isGlobalRole } from "@/lib/clinic-scope";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, id: userId, clinicId } = session.user;
  if (role !== "ADMIN" && role !== "DENTIST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.toothRecord.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Karton nije pronađen" }, { status: 404 });
  if (!isGlobalRole(role) && existing.clinicId !== clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (role === "DENTIST" && existing.dentistId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = toothRecordUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { treatedTeeth, visitDate, ...rest } = parsed.data;

  const data: Record<string, unknown> = { ...rest };
  if (visitDate) data.visitDate = new Date(visitDate);
  if (treatedTeeth) data.treatedTeeth = treatedTeeth;

  const record = await prisma.$transaction(async (tx) => {
    const updated = await tx.toothRecord.update({ where: { id }, data });

    if (treatedTeeth) {
      const chart = await tx.patientToothChart.upsert({
        where: { patientId: existing.patientId },
        create: { patientId: existing.patientId, chartData: {} },
        update: {},
      });

      const chartData = { ...(chart.chartData as Record<string, string>) };
      for (const tooth of treatedTeeth) {
        const key = String(tooth);
        const current = chartData[key];
        if (current === undefined || current === "healthy") {
          chartData[key] = "treated";
        }
      }

      await tx.patientToothChart.update({
        where: { patientId: existing.patientId },
        data: { chartData },
      });
    }

    return updated;
  });

  return NextResponse.json(record);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, id: userId, clinicId } = session.user;
  if (role !== "ADMIN" && role !== "DENTIST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.toothRecord.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Karton nije pronađen" }, { status: 404 });
  if (!isGlobalRole(role) && existing.clinicId !== clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (role === "DENTIST" && existing.dentistId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Tooth history in PatientToothChart is intentionally left untouched on delete.
  await prisma.toothRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
