import { createServerClient } from "@/lib/supabase/server";
import OrdersPageClient from "@/components/orders/OrdersPageClient";

export const metadata = {
  title: "Pesanan — SpinTrack",
};

export default async function OrdersPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("branch")
    .eq("id", user.id)
    .single();

  const branch = profile?.branch;

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("branch", branch)
    .order("created_at", {
      ascending: false,
    });

  return (
    <OrdersPageClient
      orders={orders || []}
      branch={branch}
    />
  );
}