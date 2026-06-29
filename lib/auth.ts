import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import type { AppRole } from "@/types/next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Lozinka", type: "password" },
        rememberMe: { label: "Zapamti me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;
        const rememberMe = credentials.rememberMe === "true";

        // SUPER_ADMIN is env-only and never stored in the database.
        if (
          email === process.env.SUPER_ADMIN_EMAIL &&
          password === process.env.SUPER_ADMIN_PASSWORD
        ) {
          return {
            id: "super_admin",
            name: "Super Admin",
            email: process.env.SUPER_ADMIN_EMAIL as string,
            role: "SUPER_ADMIN",
            clinicId: null,
            rememberMe,
          };
        }

        const user = await prisma.user.findFirst({
          where: { email },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          clinicId: user.clinicId,
          rememberMe,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.clinicId = user.clinicId;
        const rememberMe = (user as { rememberMe?: boolean }).rememberMe ?? false;
        token.exp = Math.floor(Date.now() / 1000) + (rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as AppRole;
        session.user.clinicId = token.clinicId as string | null;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // cookie lives 30 days max; token.exp controls actual expiry
  },
});
