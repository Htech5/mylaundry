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

  const [
    ordersResult,
    paymentsResult,
    cashResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("payments")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("cash_entries")
      .select("*")
      .order("created_at", {
        ascending: false,
      }),
  ]);

  return (
    <ReportsPageClient
      orders={
        ordersResult.data || []
      }
      payments={
        paymentsResult.data || []
      }
      cashEntries={
        cashResult.data || []
      }
    />
  );
}