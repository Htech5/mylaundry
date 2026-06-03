import { createServerClient } from "@/lib/supabase/server";
import DashboardChartClient from "./DashboardChartClient";

export default async function DashboardChart({ branch }) {
  const supabase = createServerClient();

  const year = new Date().getFullYear();

  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const { data: orders } = await supabase
    .from("orders")
    .select("package_type, created_at")
    .eq("branch", branch)
    .gte("created_at", start)
    .lte("created_at", end);

  const months = [
    "Jan","Feb","Mar","Apr","Mei","Jun",
    "Jul","Agu","Sep","Okt","Nov","Des"
  ];

  const data = months.map((month) => ({
    month,
    regular: 0,
    express: 0,
  }));

  orders?.forEach((order) => {
    const monthIndex = new Date(order.created_at).getMonth();

    if (order.package_type === "Reguler") {
      data[monthIndex].regular += 1;
    }

    if (order.package_type === "Express") {
      data[monthIndex].express += 1;
    }
  });

  return (
    <DashboardChartClient
      data={data}
      year={year}
    />
  );
}