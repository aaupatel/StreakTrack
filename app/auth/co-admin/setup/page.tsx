import { Suspense } from "react";
import CoAdminSetupForm from "@/components/CoAdminSetupForm";

export default function SetupPage() {
  return (
    <Suspense
      fallback={<div className="p-4 text-center">Loading setup form...</div>}
    >
      <CoAdminSetupForm />
    </Suspense>
  );
}