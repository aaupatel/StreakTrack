import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="p-4 text-center">Loading login form...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}