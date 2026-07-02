import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isGlobalRole } from "@/lib/clinic-scope";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clinics = await prisma.clinic.findMany({
    where: isGlobalRole(session.user.role)
      ? { isActive: true }
      : { id: session.user.clinicId ?? "", isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clinics);
}
