"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./logo";
import { Button } from "./button";
import {
  BadgeHelp,
  BadgeInfo,
  BarChart2,
  LogOut,
  Settings,
  User,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session} = useSession();

  // Don't show navbar on auth pages
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  // Array of paths where the navbar should be visible
  const showNavbarOn = [
    "/", // Homepage
    "/dashboard",
    "/profile",
    "/about",
    "/help",
    "/contact",
    "/settings",
  ];

  // Check if the current pathname matches any of the paths or starts with /dashboard/
  const shouldShowNavbar =
    showNavbarOn.includes(pathname) || pathname.startsWith("/dashboard/");

  if (!shouldShowNavbar) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div id="logo" className="flex">
            <Link href="/" className="flex items-center">
              <Logo className="mr-2" size={50} />
              <span className="font-semibold text-xl sm:block hidden">
                StreakTrack
              </span>
            </Link>
          </div>

          <div className="flex items-center sm:gap-4 gap-1 sm:text-base text-xs">
            <Link href="/dashboard" className="hidden sm:flex items-center">
              <span className="px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-200 hover:text-gray-900">
                Dashboard
              </span>
            </Link>
            <Link href="/about" className="hidden sm:flex items-center">
              <span className="px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-200 hover:text-gray-900">
                About Us
              </span>
            </Link>
            <Link href="/help" className="hidden sm:flex items-center">
              <span className="px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-200 hover:text-gray-900">
                Help Center
              </span>
            </Link>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          session.user?.profileImage || "/default-avatar.png"
                        }
                        alt={session.user?.name}
                      />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 p-2 cursor-pointer"
                  >
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="sm:hidden flex">
                    <Link href="/dashboard" className="cursor-pointer">
                      <BarChart2 className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/about" className="cursor-pointer">
                      <BadgeInfo className="mr-2 h-4 w-4" /> About Us
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="cursor-pointer">
                      <BadgeHelp className="mr-2 h-4 w-4" /> Help Center
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button size="lg" className="mr-4">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
