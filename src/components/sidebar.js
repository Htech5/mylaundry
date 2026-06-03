"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingBag, CreditCard, Wallet,
  BarChart3, WashingMachine, LogOut, Menu, X, ChevronRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { href: "/orders",    label: "Pesanan",       icon: ShoppingBag     },
  { href: "/payments",  label: "Pembayaran",    icon: CreditCard      },
  { href: "/cash",      label: "Kas",           icon: Wallet          },
  { href: "/reports",   label: "Laporan",       icon: BarChart3       },
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
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border">
        <div className="w-9 h-9 bg-primary-500/10 border border-primary-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
          <WashingMachine className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">myLaundry</p>
          <p className="text-xs text-accent">{branch}</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-primary-500/15 text-primary-300 border border-primary-500/20"
                  : "text-slate-400 hover:text-white hover:bg-surface-card"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-primary-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="px-3 pb-4 border-t border-surface-border pt-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-300">
              {(userName || branch || "A").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{userName || "Admin"}</p>
            <p className="text-xs text-slate-500 truncate">Cabang {branch}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? "Keluar..." : "Keluar"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-surface-card border-r border-surface-border h-screen sticky top-0 flex-shrink-0">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface-card border-b border-surface-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <WashingMachine className="w-5 h-5 text-primary-400" />
          <span className="font-bold text-white text-sm">myLaundry</span>
          <span className="text-xs text-accent">• {branch}</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
          <Menu className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 modal-backdrop" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-card flex flex-col animate-slide-up">
            <div className="flex items-center justify-end px-4 py-3 border-b border-surface-border">
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}