import { Suspense } from "react";
import { LayoutDashboard } from "lucide-react";

import { createServerClient } from "@/lib/supabase/server";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardChart from "@/components/dashboard/DashboardChart";

export const metadata = {
  title: "Dashboard — myLaundry",
};

export default async function DashboardPage() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Dashboard
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Cabang{" "}
              <span className="font-medium text-slate-700">
                {branch}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <Suspense fallback={<StatsSkeletons />}>
        <DashboardStats branch={branch} />
      </Suspense>

      {/* Grafik */}
      <Suspense fallback={<ChartSkeleton />}>
        <DashboardChart branch={branch} />
      </Suspense>
    </div>
  );
}

function StatsSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
  );
}