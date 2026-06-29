import type { Role } from "@prisma/client";
import "next-auth";

// SUPER_ADMIN is env-based only and intentionally not part of the Prisma Role enum.
export type AppRole = Role | "SUPER_ADMIN";

declare module "next-auth" {
  interface User {
    role: AppRole;
    clinicId: string | null;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: AppRole;
      clinicId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: AppRole;
    clinicId: string | null;
  }
}
