"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Wallet,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/orders",
    label: "Pesanan",
    icon: ShoppingBag,
  },
  {
    href: "/payments",
    label: "Pembayaran",
    icon: CreditCard,
  },
  {
    href: "/cash",
    label: "Kas",
    icon: Wallet,
  },
  {
    href: "/reports",
    label: "Laporan",
    icon: BarChart3,
  },
];

export default function Sidebar({ branch, userName }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  const NavContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 bg-blue-600 px-5 py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Image
              src="/favicon.ico"
              alt="SpinTrack"
              width={48}
              height={48}
            />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            SpinTrack
          </h2>

          <p className="text-sm text-blue-100">
            Cabang {branch}
          </p>
          
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 ${
                  active
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-700"
                }`}
              />

              <span>{label}</span>

              {active && (
                <ChevronRight className="ml-auto h-4 w-4 text-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <span className="font-bold text-blue-700">
              {(userName || branch || "A")
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {userName || "Admin"}
            </p>

            <p className="truncate text-xs text-slate-500">
              Cabang {branch}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="
            flex w-full items-center gap-3
            rounded-xl
            border border-red-100
            px-3 py-3
            text-sm font-medium
            text-red-600
            transition-all
            hover:bg-red-600
            hover:text-white
          "
        >
          <LogOut className="h-4 w-4" />

          {loggingOut ? "Keluar..." : "Keluar"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/favicon.ico"
            alt="myLaundry"
            width={24}
            height={24}
          />

          <span className="font-semibold text-slate-900">
            SpinTrack
          </span>

          <span className="text-xs text-slate-500">
            • {branch}
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute bottom-0 left-0 top-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex justify-end border-b border-slate-200 p-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-700" />
              </button>
            </div>

            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}