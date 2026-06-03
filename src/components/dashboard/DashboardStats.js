import { createServerClient } from "@/lib/supabase/server";
import {
  ShoppingBag,
  Truck,
  Zap,
  Wallet,
} from "lucide-react";

export default async function DashboardStats({ branch }) {
  const supabase = createServerClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("package_type,total_price")
    .eq("branch", branch);

  const totalOrders = orders?.length || 0;

  const regularCount =
    orders?.filter(
      (o) => o.package_type === "Reguler"
    ).length || 0;

  const expressCount =
    orders?.filter(
      (o) => o.package_type === "Express"
    ).length || 0;

  const totalRevenue =
    orders?.reduce(
      (sum, o) => sum + Number(o.total_price),
      0
    ) || 0;

  const cards = [
    {
      title: "Total Order",
      value: totalOrders,
      icon: ShoppingBag,
    },
    {
      title: "Paket Reguler",
      value: regularCount,
      icon: Truck,
    },
    {
      title: "Paket Express",
      value: expressCount,
      icon: Zap,
    },
    {
      title: "Total Omzet",
      value: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
      icon: Wallet,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              shadow-sm
              p-6
            "
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {card.title}
              </p>

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-slate-900 mt-4">
              {card.value}
            </h3>
          </div>
        );
      })}
    </div>
  );
}