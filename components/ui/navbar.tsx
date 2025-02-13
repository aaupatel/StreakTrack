"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "./logo";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Don't show navbar on auth pages
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Logo className="mr-2" />
              <span className="font-semibold text-xl">StreakTrack</span>
            </Link>
          </div>

          <div className="flex items-center">
            {session ? (
              <>
                <span className="text-gray-600 mr-4">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}