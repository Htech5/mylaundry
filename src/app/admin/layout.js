import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import Sidebar from "@/components/sidebar";

export default async function AppLayout({ children }) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("branch, full_name")
    .eq("id", user.id)
    .single();

  const branch   = profile?.branch;
  const userName = profile?.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar branch={branch} userName={userName} />

      {/*
        On mobile: push content down below the fixed top bar (h-14 = 56px).
        On desktop: no top offset needed.
      */}
      <main className="flex-1 min-w-0 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
