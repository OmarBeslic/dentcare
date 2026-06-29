import type { NextAuthConfig } from "next-auth";
import type { AppRole } from "@/types/next-auth";

// Edge-compatible config — no Prisma, no Node.js native modules.
// Used only by the proxy for route protection.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/admin/login";
      if (isLoginPage) return true;

      if (nextUrl.pathname.startsWith("/super-admin")) {
        return isLoggedIn && auth?.user?.role === "SUPER_ADMIN";
      }

      return isLoggedIn;
    },
    // This proxy-only instance has no jwt/session callbacks of its own otherwise,
    // so without this, token.role never reaches auth.user above and the
    // SUPER_ADMIN check would always fail.
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as AppRole;
      }
      return session;
    },
  },
  providers: [],
};
