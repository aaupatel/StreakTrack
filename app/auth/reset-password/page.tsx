import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-4 text-center">Loading reset form...</div>}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}