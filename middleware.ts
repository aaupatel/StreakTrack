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

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
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

// Apply middleware to /dashboard and auth pages
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};




// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { auth } from "./lib/auth";

// export async function middleware(request: NextRequest) {
//   const session = await auth();
//   console.log("Session in middleware:", session);

//   // Public paths that don't require authentication
//   const publicPaths = [
//     '/auth/login',
//     '/auth/register',
//     '/auth/verify',
//     '/auth/co-admin/setup'
//   ];

//   // Check if the current path is public
//   const isPublicPath = publicPaths.some(path => 
//     request.nextUrl.pathname.startsWith(path)
//   );

//   // Protect dashboard routes
//   if (request.nextUrl.pathname.startsWith("/dashboard")) {
//     if (!session) {
//       const loginUrl = new URL("/auth/login", request.url);
//       loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
//       return NextResponse.redirect(loginUrl);
//     }

//     // Check for specific role-based access
//     if (request.nextUrl.pathname.startsWith("/dashboard/co-admins") && 
//         session.user.role !== 'admin') {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//   }

//   // Redirect authenticated users from auth pages to dashboard
//   if (isPublicPath && session) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/auth/:path*"
//   ]
// };