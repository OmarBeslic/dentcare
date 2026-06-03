import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "public");
  if (limited) return limited;
  const dentists = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "DENTIST"] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(dentists);
}
