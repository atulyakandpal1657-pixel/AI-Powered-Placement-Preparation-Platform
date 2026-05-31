import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;
  const isProtectedRoute =
    path === "/" ||
    path.startsWith("/dsa-tracker") ||
    path.startsWith("/resume") ||
    path.startsWith("/notes");

  // Protect the dashboard routes
  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login if there is no token
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect to dashboard if logged in user tries to access auth pages
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")
  ) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on specific routes
  matcher: ["/", "/dsa-tracker/:path*", "/resume/:path*", "/notes/:path*", "/login", "/signup"],
};
