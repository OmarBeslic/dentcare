import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toothRecordSchema } from "@/lib/validations";
import type { AssistantRestrictions } from "@/lib/permissions";
import { isGlobalRole } from "@/lib/clinic-scope";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");
  if (!patientId) {
    return NextResponse.json({ error: "patientId je obavezan" }, { status: 400 });
  }
  const toothNumberParam = searchParams.get("toothNumber");
  const toothNumber = toothNumberParam ? parseInt(toothNumberParam) : null;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { clinicId: true },
  });
  if (!patient) return NextResponse.json({ error: "Pacijent nije pronađen" }, { status: 404 });

  const { role, id: userId, clinicId } = session.user;
  if (!isGlobalRole(role) && patient.clinicId !== clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const where: Record<string, unknown> = { patientId };
  if (toothNumber !== null && !Number.isNaN(toothNumber)) {
    where.treatedTeeth = { has: toothNumber };
  }
  if (role === "DENTIST") {
    where.dentistId = userId;
  }

  let records = await prisma.toothRecord.findMany({
    where,
    orderBy: { visitDate: "desc" },
  });

  if (role === "ASSISTANT") {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId! },
      select: { assistantRestrictions: true },
    });
    const restrictions = (clinic?.assistantRestrictions ?? {}) as AssistantRestrictions;
    if (restrictions.financials) {
      records = records.map((r) => {
        const { price, isPaid, ...rest } = r;
        return rest as typeof r;
      });
    }
  }

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, id: userId, name, clinicId } = session.user;
  if (role !== "ADMIN" && role !== "DENTIST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = toothRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { patientId, treatedTeeth, diagnosis, serviceType, price, isPaid, notes, visitDate } =
    parsed.data;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { clinicId: true },
  });
  if (!patient) return NextResponse.json({ error: "Pacijent nije pronađen" }, { status: 404 });
  if (!isGlobalRole(role) && patient.clinicId !== clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const record = await prisma.$transaction(async (tx) => {
    const created = await tx.toothRecord.create({
      data: {
        patientId,
        clinicId: patient.clinicId,
        dentistId: userId,
        treatedTeeth,
        diagnosis,
        serviceType,
        price,
        isPaid,
        notes,
        visitDate: new Date(visitDate),
        doctorSignature: name,
      },
    });

    const chart = await tx.patientToothChart.upsert({
      where: { patientId },
      create: { patientId, chartData: {} },
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
      where: { patientId },
      data: { chartData },
    });

    return created;
  });

  return NextResponse.json(record, { status: 201 });
}
