import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardChart from "@/components/dashboard/DashboardChart";
import { LayoutDashboard } from "lucide-react";

export const metadata = { title: "Dashboard — myLaundry" };

export default async function DashboardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { data: profile } = await supabase
    .from("profiles").select("branch").eq("id", session.user.id).single();

  const branch = profile?.branch || "";

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">Cabang {branch} — Ringkasan hari ini</p>
        </div>
      </div>

      {/* Stats cards */}
      <Suspense fallback={<StatsSkeletons />}>
        <DashboardStats branch={branch} />
      </Suspense>

      {/* Chart */}
      <div className="mt-6">
        <Suspense fallback={<ChartSkeleton />}>
          <DashboardChart branch={branch} />
        </Suspense>
      </div>
    </div>
  );
}

function StatsSkeletons() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card h-28 skeleton" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="card h-80 skeleton" />;
}