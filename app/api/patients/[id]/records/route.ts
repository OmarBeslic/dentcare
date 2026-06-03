import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const records = await prisma.patientRecord.findMany({
    where: { patientId: id },
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { visitDate: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = recordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const record = await prisma.patientRecord.create({
    data: {
      patientId: id,
      createdById: session.user.id,
      visitDate: new Date(parsed.data.visitDate),
      diagnosis: parsed.data.diagnosis,
      treatment: parsed.data.treatment,
      prescription: parsed.data.prescription,
      notes: parsed.data.notes,
      toothChart: (parsed.data.toothChart ?? {}) as object,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  });

  return NextResponse.json(record, { status: 201 });
}
