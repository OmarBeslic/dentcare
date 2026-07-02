import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toothChartUpdateSchema } from "@/lib/validations";
import { isGlobalRole } from "@/lib/clinic-scope";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patientId } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { clinicId: true },
  });
  if (!patient) return NextResponse.json({ error: "Pacijent nije pronađen" }, { status: 404 });

  const { role, clinicId } = session.user;
  if (!isGlobalRole(role) && patient.clinicId !== clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [chart, records] = await Promise.all([
    prisma.patientToothChart.upsert({
      where: { patientId },
      create: { patientId, chartData: {} },
      update: {},
    }),
    prisma.toothRecord.findMany({
      where: { patientId },
      select: { treatedTeeth: true },
    }),
  ]);

  const treatedTeeth = Array.from(
    new Set(records.flatMap((r) => r.treatedTeeth))
  ).sort((a, b) => a - b);

  return NextResponse.json({ chartData: chart.chartData, treatedTeeth });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, clinicId } = session.user;
  if (role !== "ADMIN" && role !== "DENTIST") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { patientId } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { clinicId: true },
  });
  if (!patient) return NextResponse.json({ error: "Pacijent nije pronađen" }, { status: 404 });
  if (!isGlobalRole(role) && patient.clinicId !== clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = toothChartUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { toothNumber, condition } = parsed.data;

  const chart = await prisma.patientToothChart.upsert({
    where: { patientId },
    create: { patientId, chartData: {} },
    update: {},
  });

  const chartData = { ...(chart.chartData as Record<string, string>) };
  chartData[String(toothNumber)] = condition;

  const updated = await prisma.patientToothChart.update({
    where: { patientId },
    data: { chartData },
  });

  return NextResponse.json(updated);
}
