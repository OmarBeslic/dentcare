import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { clinicId: _clinicId, id: _id, ...data } = await req.json();

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id, clinicId: session.user.clinicId! },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // prevent deleting yourself
  if (id === session.user.id) {
    return NextResponse.json({ error: "Ne možete obrisati svoj nalog." }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id, clinicId: session.user.clinicId! } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
    }
    throw e;
  }
}
