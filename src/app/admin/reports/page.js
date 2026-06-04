import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabase/server";

import ReportsPageClient from "@/components/reports/ReportsPageClient";

export const metadata = {
  title: "Laporan — SpinTrack",
};

export default async function ReportsPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cashEntries } =
    await supabase
      .from("cash_entries")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  return (
    <ReportsPageClient
      cashEntries={
        cashEntries || []
      }
    />
  );
}