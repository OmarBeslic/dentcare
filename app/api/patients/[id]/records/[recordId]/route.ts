import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, recordId } = await params;
  const record = await prisma.patientRecord.findFirst({
    where: { id: recordId, patientId: id },
    include: {
      createdBy: { select: { id: true, name: true } },
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, recordId } = await params;
  const body = await req.json();
  const parsed = recordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const record = await prisma.patientRecord.update({
    where: { id: recordId, patientId: id },
    data: {
      visitDate: new Date(parsed.data.visitDate),
      diagnosis: parsed.data.diagnosis,
      treatment: parsed.data.treatment,
      prescription: parsed.data.prescription,
      notes: parsed.data.notes,
      toothChart: (parsed.data.toothChart ?? {}) as object,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  });

  return NextResponse.json(record);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, recordId } = await params;
  await prisma.patientRecord.delete({ where: { id: recordId, patientId: id } });
  return NextResponse.json({ success: true });
}
