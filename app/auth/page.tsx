import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/supabase/queries";

export default async function AuthPage() {
  const { user } = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthForm />
    </main>
  );
}
