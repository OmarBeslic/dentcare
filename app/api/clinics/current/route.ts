import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.clinicId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const clinic = await prisma.clinic.findUnique({ where: { id: session.user.clinicId } });
  if (!clinic) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(clinic);
}
