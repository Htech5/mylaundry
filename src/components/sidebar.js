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
  { href: "/admin/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/orders",    label: "Pesanan",     icon: ShoppingBag },
  { href: "/admin/payments",  label: "Pembayaran",  icon: CreditCard },
  { href: "/admin/cash",      label: "Kas",         icon: Wallet },
  { href: "/admin/reports",   label: "Laporan",     icon: BarChart3 },
];

export default function Sidebar({ branch, userName }) {
  const pathname = usePathname();
  const router   = useRouter();
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
    <div className="flex flex-col h-full bg-white">

      {/* ── Brand header — biru solid ── */}
      <div className="flex items-center gap-3 bg-blue-600 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
          <Image src="/favicon.ico" alt="SpinTrack" width={24} height={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">SpinTrack</p>
          <p className="text-xs text-blue-100 mt-0.5">Cabang {branch}</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${
                active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
              }`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-blue-200" />}
            </Link>
          );
        })}
      </nav>

      {/* ── User + logout ── */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
            <span className="text-xs font-bold text-blue-700">
              {(userName || branch || "A").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 leading-none">
              {userName || "Admin"}
            </p>
            <p className="truncate text-xs text-slate-400 mt-0.5">Cabang {branch}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Keluar..." : "Keluar"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ════ DESKTOP sidebar ════ */}
      <aside className="hidden w-60 flex-col border-r border-slate-200 shadow-sm lg:flex">
        <NavContent />
      </aside>

      {/* ════ MOBILE top bar ════ */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-blue-600 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <Image src="/favicon.ico" alt="SpinTrack" width={16} height={16} />
          </div>
          <span className="text-sm font-bold text-white">SpinTrack</span>
          <span className="text-xs text-blue-200">· {branch}</span>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* ════ MOBILE drawer backdrop ════ */}
      <div
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 z-50 lg:hidden transition-all duration-300"
        style={{
          background: mobileOpen ? "rgba(15,23,42,0.45)" : "rgba(15,23,42,0)",
          backdropFilter: mobileOpen ? "blur(2px)" : "none",
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      />

      {/* ════ MOBILE drawer (slide from RIGHT) ════ */}
      <aside
        className="fixed top-0 bottom-0 right-0 z-50 w-64 flex flex-col lg:hidden bg-white"
        style={{
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: mobileOpen ? "-8px 0 40px rgba(15,23,42,0.12)" : "none",
        }}
      >
        {/* Close button — konsisten biru seperti top bar */}
        <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
              <Image src="/favicon.ico" alt="SpinTrack" width={16} height={16} />
            </div>
            <span className="text-sm font-bold text-white">SpinTrack</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Nav content tanpa header brand (sudah ada di atas) */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Menu
            </p>
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${
                    active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  }`} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-blue-200" />}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-3 space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
                <span className="text-xs font-bold text-blue-700">
                  {(userName || branch || "A").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 leading-none">
                  {userName || "Admin"}
                </p>
                <p className="truncate text-xs text-slate-400 mt-0.5">Cabang {branch}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}