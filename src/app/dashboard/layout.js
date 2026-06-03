import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("branch, full_name")
    .eq("id", session.user.id)
    .single();

  const branch = profile?.branch || "Unknown";
  const userName = profile?.full_name || session.user.email?.split("@")[0] || "Admin";

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar branch={branch} userName={userName} />
      <main className="flex-1 min-w-0 lg:overflow-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}