import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validations";
import { getEffectiveClinicId } from "@/lib/clinic-scope";
import bcrypt from "bcryptjs";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // admin has access to all users
  const effectiveClinicId = await getEffectiveClinicId(session.user.role, session.user.clinicId);
  // if effectiveClinicId is null, then the user is an admin and has access to all users
  const where = effectiveClinicId ? { clinicId: effectiveClinicId } : {};

  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // if effectiveClinicId is null, then its not possible to add users, because the user has no clinic
  const effectiveClinicId = await getEffectiveClinicId(session.user.role, session.user.clinicId);
  if (!effectiveClinicId) {
    return NextResponse.json(
      { error: "Izaberite kliniku prije dodavanja osoblja." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        ...parsed.data,
        clinicId: effectiveClinicId,
        password: await bcrypt.hash(parsed.data.password, 10),
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Email je već u upotrebi." }, { status: 409 });
    }
    throw e;
  }
}
