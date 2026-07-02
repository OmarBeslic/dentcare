import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assistantRestrictionsSchema } from "@/lib/validations";
import type { AssistantRestrictions } from "@/lib/permissions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (id !== session.user.clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id },
    select: { assistantRestrictions: true },
  });
  if (!clinic) return NextResponse.json({ error: "Klinika nije pronađena" }, { status: 404 });

  return NextResponse.json(clinic.assistantRestrictions);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (id !== session.user.clinicId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = assistantRestrictionsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id },
    select: { assistantRestrictions: true },
  });
  if (!clinic) return NextResponse.json({ error: "Klinika nije pronađena" }, { status: 404 });

  const current = (clinic.assistantRestrictions ?? {}) as AssistantRestrictions;
  const updated = await prisma.clinic.update({
    where: { id },
    data: { assistantRestrictions: { ...current, ...parsed.data } },
  });

  return NextResponse.json(updated.assistantRestrictions);
}
