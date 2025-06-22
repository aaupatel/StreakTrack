import { Suspense } from "react";
import VerifyPageClient from "@/components/VerifyPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Verifying...</div>}>
      <VerifyPageClient />
    </Suspense>
  );
}