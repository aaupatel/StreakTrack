"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  CalendarCheck2, 
  BarChart2, 
  UserPlus,
  LogOut,
  Menu,
  Camera
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "@/components/ui/logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession(); // Get user session
  const userRole = session?.user?.role; // Get user role

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart2 },
    { name: "Students", href: "/dashboard/students", icon: Users },
    { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck2 },
    {
      name: "Register Student",
      href: "/dashboard/register-student",
      icon: UserPlus,
    },
    { name: "Members", href: "/dashboard/members", icon: UserPlus },
    { name: "Hardware Setup", href: "/dashboard/hardware", icon: UserPlus },
  ];

  if (userRole === "admin") {
    navigation.push({
      name: "Co-Admins",
      href: "/dashboard/co-admins",
      icon: UserPlus,
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div
          className="fixed inset-0 bg-gray-900/80 z-40"
          style={{ display: sidebarOpen ? "block" : "none" }}
          onClick={() => setSidebarOpen(false)}
        />
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-center gap-2 px-6 border-b border-gray-200">
            <Logo className="h-16 w-16 text-primary" />
            {/* <Camera className="h-6 w-6 text-primary" /> */}
            {/* <h1 className="text-xl font-semibold text-gray-900">StreakTrack</h1> */}
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 w-full"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 h-16 flex items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}