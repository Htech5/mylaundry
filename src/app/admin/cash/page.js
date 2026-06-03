import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

import CashPageClient from "@/components/cash/CashPageClient";

export const metadata = {
  title: "Kas — SpinTrack",
};

export default async function CashPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: cashEntries = [] } =
    await supabase
      .from("cash_entries")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  return (
    <CashPageClient
      cashEntries={cashEntries}
    />
  );
}