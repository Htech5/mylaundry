import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabase/server";

import PaymentsPageClient from "@/components/payments/PaymentsPageClient";

export const metadata = {
  title: "Pembayaran — SpinTrack",
};

export default async function PaymentsPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("branch")
      .eq("id", user.id)
      .single();

  const branch =
    profile?.branch || "";

  // Semua pembayaran cabang
  const { data: payments = [] } =
    await supabase
      .from("payments")
      .select("*")
      .eq("branch", branch)
      .order("created_at", {
        ascending: false,
      });

  // Order yang belum lunas
  const { data: orders = [] } =
    await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        customer_phone,
        total_price,
        amount_paid,
        payment_status
      `)
      .eq("branch", branch)
      .neq("payment_status", "paid")
      .order("created_at", {
        ascending: false,
      });

  return (
    <PaymentsPageClient
      branch={branch}
      payments={payments}
      orders={orders}
    />
  );
}