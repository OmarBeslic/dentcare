import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isGlobalRole } from "@/lib/clinic-scope";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        include: { dentist: { select: { id: true, name: true } } },
        orderBy: { startTime: "desc" },
      },
      toothRecords: {
        orderBy: { visitDate: "desc" },
      },
      toothChart: true,
      _count: { select: { appointments: true, toothRecords: true } },
    },
  });

  if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isGlobalRole(session.user.role) && patient.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(patient);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.patient.findUnique({ where: { id }, select: { clinicId: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isGlobalRole(session.user.role) && existing.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  delete body.clinicId;

  if (body.dateOfBirth) body.dateOfBirth = new Date(body.dateOfBirth);

  const patient = await prisma.patient.update({ where: { id }, data: body });
  return NextResponse.json(patient);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.patient.findUnique({ where: { id }, select: { clinicId: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isGlobalRole(session.user.role) && existing.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.patient.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
