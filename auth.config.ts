import type { NextAuthConfig } from "next-auth";

// Edge-compatible config — no Prisma, no Node.js native modules.
// Used only by middleware for route protection.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/admin/login";
      if (isLoginPage) return true;
      return isLoggedIn;
    },
  },
  providers: [],
};
