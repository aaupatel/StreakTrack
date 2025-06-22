import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  // console.log(token);

  // Define public auth routes
  const authPaths = ["/auth/login", "/auth/register"];

  // Redirect logged-in users from auth pages to the dashboard
  if (token && authPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Protect dashboard, profile, and settings routes
  const protectedPaths = ["/dashboard", "/profile", "/settings"];

  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Restrict /dashboard/co-admins to admin users only
  if (request.nextUrl.pathname.startsWith("/dashboard/co-admins")) {
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url)); // Redirect unauthorized users to dashboard
    }
  }

  return NextResponse.next();
}

// Apply middleware to dashboard, profile, settings, and auth pages
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/auth/:path*"],
};
