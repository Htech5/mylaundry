"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BRANCHES } from "@/lib/constants";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({ email: "", password: "", branch: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.branch) {
      setError("Pilih cabang terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      const { data: profile } = await supabase
        .from("profiles")
        .select("branch")
        .eq("id", data.user.id)
        .single();

      if (profile && profile.branch !== form.branch) {
        await supabase.auth.signOut();
        throw new Error("Cabang tidak sesuai dengan akun ini.");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "Email atau password salah."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 lg:p-6 lg:bg-slate-100">

      {/* ── MOBILE BACKGROUND (< lg) ── */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          backgroundImage: "url('/images/laundry-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
      </div>

      {/* ── CARD ── */}
      <div
        className="relative z-10 w-full max-w-6xl rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.12)] grid lg:grid-cols-2"
        style={{ background: "#ffffff" }}
      >

        {/* ════ LEFT SIDE — Desktop only ════ */}
        <div className="relative hidden lg:block">
          <img
            src="/images/laundry-hero.jpg"
            alt="Laundry"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-blue-600/20 to-blue-700/80" />

          <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
            {/* Brand badge */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 w-fit">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">SpinTrack</h3>
                  <p className="text-slate-500 text-sm">Manajemen Laundry Multi-Cabang</p>
                </div>
              </div>
            </div>

            {/* Bottom copy */}
            <div>
              <h1 className="text-5xl font-bold leading-tight max-w-lg">
                Kelola Laundry
                <br />
                Lebih Efisien
              </h1>
              <p className="mt-5 text-lg text-blue-50 max-w-md">
                Pantau operasional, transaksi dan laporan seluruh cabang
                dalam satu dashboard modern.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-10">
                {[
                  { title: "Real-time", sub: "Monitoring transaksi" },
                  { title: "Multi Cabang", sub: "Kelola semua outlet" },
                  { title: "Aman", sub: "Data tersimpan aman" },
                ].map((item) => (
                  <div key={item.title} className="bg-white/15 backdrop-blur-md rounded-2xl p-4">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-blue-100 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT SIDE — Form ════ */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">

            {/* ── MOBILE header: logo favicon centered (scale-up, no bg) ── */}
            <div className="flex flex-col items-center gap-2 mb-10 lg:hidden">
              <img
                src="/favicon.ico"
                alt="SpinTrack"
                style={{
                  width: 58,
                  height: 58,
                  transform: "scale(1.8)",
                  transformOrigin: "center",
                  marginBottom: 16,
                }}
              />
            </div>

            {/* ── DESKTOP header: Welcome Back ── */}
            <div className="hidden lg:block mb-10">
              <h2 className="text-4xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-slate-500 mt-3">Masuk ke akun SpinTrack Anda</p>
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Cabang */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-800">
                  Cabang
                </label>
                <select
                  value={form.branch}
                  onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border outline-none transition-all
                    bg-slate-50 border-slate-200 text-slate-900
                    focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Pilih Cabang</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@mylaundry.id"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border outline-none transition-all
                    bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400
                    focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border outline-none transition-all
                      bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400
                      focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                disabled={loading}
                type="submit"
                className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70
                  text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <p className="text-center text-sm mt-8 text-slate-400">
              © 2026 SpinTrack. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}