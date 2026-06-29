"use server";

import { cookies } from "next/headers";

export async function setSelectedClinic(clinicId: string) {
  const cookieStore = await cookies();
  cookieStore.set("selectedClinicId", clinicId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
