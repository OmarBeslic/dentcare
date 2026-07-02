import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validations";
import type { AssistantRestrictions } from "@/lib/permissions";
import { getEffectiveClinicId } from "@/lib/clinic-scope";

// Patients whose first name starts with this prefix (e.g. "#Marko") are
// hidden from the default list and from any search that doesn't itself
// start with the prefix — only a search like "#Mark" can surface them.
const HIDDEN_PREFIX = "#";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { role, id: userId, clinicId } = session.user;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const isHiddenSearch = search.startsWith(HIDDEN_PREFIX);

  // trim once — a trailing space ("test ") must not narrow results by
  // making Postgres look for LIKE '%test %' instead of LIKE '%test%'.
  const searchTerm = search.trim();
  const parts = searchTerm.split(/\s+/).filter(Boolean);

  // When the query contains a space ("Marko N") split it and require
  // firstName to match one part AND lastName the other, so typing a
  // full name finds the right patient instead of returning nothing.
  const searchFilter = !searchTerm
    ? {}
    : parts.length >= 2
    ? {
        OR: [
          {
            AND: [
              { firstName: { contains: parts[0], mode: "insensitive" as const } },
              { lastName: { contains: parts.slice(1).join(" "), mode: "insensitive" as const } },
            ],
          },
          {
            AND: [
              { firstName: { contains: parts.slice(1).join(" "), mode: "insensitive" as const } },
              { lastName: { contains: parts[0], mode: "insensitive" as const } },
            ],
          },
        ],
      }
    : {
        OR: [
          { firstName: { contains: searchTerm, mode: "insensitive" as const } },
          { lastName: { contains: searchTerm, mode: "insensitive" as const } },
          { phone: { contains: searchTerm } },
          { jmbg: { contains: searchTerm } },
        ],
      };

  const visibilityFilter = isHiddenSearch
    ? {}
    : { NOT: { firstName: { startsWith: HIDDEN_PREFIX } } };

  // Role-based scoping — ADMIN/SUPER_ADMIN follow the ClinicSwitcher
  // selection (or see every clinic when "Sve klinike" is chosen);
  // ASSISTANT is confined to their own clinic; DENTIST is further limited
  // to patients they've actually treated or booked.
  let scopeFilter: Record<string, unknown> = {};
  if (role === "DENTIST") {
    scopeFilter = {
      clinicId,
      OR: [
        { createdById: userId },
        { toothRecords: { some: { dentistId: userId } } },
        { appointments: { some: { dentistId: userId } } },
      ],
    };
  } else if (role === "ASSISTANT") {
    scopeFilter = { clinicId };
  } else {
    const effectiveClinicId = await getEffectiveClinicId(role, clinicId);
    if (effectiveClinicId) scopeFilter = { clinicId: effectiveClinicId };
  }

  const where = { AND: [scopeFilter, searchFilter, visibilityFilter] };

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: {
        _count: { select: { appointments: true, toothRecords: true } },
        appointments: {
          orderBy: { startTime: "desc" },
          take: 1,
          select: { startTime: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  let result = patients;
  if (role === "ASSISTANT" && clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { assistantRestrictions: true },
    });
    const restrictions = (clinic?.assistantRestrictions ?? {}) as AssistantRestrictions;
    if (restrictions.jmbg) {
      result = patients.map(({ jmbg, ...rest }) => rest) as typeof patients;
    }
  }

  return NextResponse.json({ patients: result, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const effectiveClinicId = await getEffectiveClinicId(session.user.role, session.user.clinicId);
  if (!effectiveClinicId) {
    return NextResponse.json(
      { error: "Izaberite kliniku prije dodavanja pacijenta." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const patient = await prisma.patient.create({
      data: {
        ...parsed.data,
        clinicId: effectiveClinicId,
        createdById: session.user.id,
        dateOfBirth: new Date(parsed.data.dateOfBirth),
      },
    });
    return NextResponse.json(patient, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Pacijent sa ovim JMBG-om već postoji." },
        { status: 409 }
      );
    }
    throw e;
  }
}
