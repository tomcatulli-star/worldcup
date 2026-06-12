import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/queries";

export default async function HomePage() {
  const { user } = await getSessionUser();
  redirect(user ? "/dashboard" : "/auth");
}
