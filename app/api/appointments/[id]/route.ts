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
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      dentist: { select: { id: true, name: true, email: true } },
    },
  });

  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isGlobalRole(session.user.role) && appointment.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.role === "DENTIST" && appointment.dentistId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(appointment);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.appointment.findUnique({
    where: { id },
    select: { clinicId: true, dentistId: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isGlobalRole(session.user.role) && existing.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.role === "DENTIST" && existing.dentistId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clinicId: _clinicId, ...data } = await req.json();

  const appointment = await prisma.appointment.update({
    where: { id },
    data,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      dentist: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(appointment);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.appointment.findUnique({
    where: { id },
    select: { clinicId: true, dentistId: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isGlobalRole(session.user.role) && existing.clinicId !== session.user.clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.role === "DENTIST" && existing.dentistId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
