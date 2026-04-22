import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // RBAC: Admin routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // RBAC: Staff routes (if any specific routes are created in future)
    if (path.startsWith("/staff") && token?.role !== "STAFF") {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|logo.png|banner.png|favicon.png|icon.png).*)",
  ],
};
