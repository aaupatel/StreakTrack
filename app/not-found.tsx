"use client";

import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 flex flex-col items-center justify-center text-center">
      <div className="mb-8">
        <Logo className="h-48 w-48 text-primary" />
      </div>
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-2xl text-gray-700 mb-2">Page Not Found</p>
      <p className="text-gray-600 mb-6">
        The page you were looking for appears to have been moved, deleted or
        does not exist.
      </p>
      <Link href="/">
        <Button className="">Back to Home</Button>
      </Link>
    </div>
  );
}
