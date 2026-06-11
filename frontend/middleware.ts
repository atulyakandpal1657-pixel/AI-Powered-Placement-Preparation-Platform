import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  // Also check Authorization header as fallback
  const authHeader = request.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const isAuthenticated = (token && token !== "none") || headerToken;
  
  const path = request.nextUrl.pathname;
  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/dsa-tracker") ||
    path.startsWith("/resume") ||
    path.startsWith("/notes");

  // Protect the dashboard routes
  if (isProtectedRoute) {
    if (!isAuthenticated) {
      // Redirect to login if there is no valid token
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect to dashboard if logged in user visits landing page
  if (path === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect to dashboard if logged in user tries to access auth pages
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")
  ) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on specific routes
  matcher: ["/", "/dashboard/:path*", "/dsa-tracker/:path*", "/resume/:path*", "/notes/:path*", "/login", "/signup"],
};
