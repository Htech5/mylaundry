"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BRANCHES } from "@/lib/constants";
import { Loader2, WashingMachine, Eye, EyeOff } from "lucide-react";

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

      // Verifikasi cabang sesuai profil
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
      setError(err.message === "Invalid login credentials"
        ? "Email atau password salah."
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 lg:p-6">

      {/* Background Mobile */}
      <div className="absolute inset-0 lg:hidden">
        <img
          src="/images/laundry-hero.jpg"
          alt="Laundry"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="
        relative
        z-10
        w-full
        max-w-6xl
        bg-white/95
        backdrop-blur-md
        rounded-[28px]
        overflow-hidden
        shadow-[0_20px_60px_rgba(15,23,42,0.08)]
        grid
        lg:grid-cols-2
      ">
        {/* LEFT SIDE */}
        <div className="relative hidden lg:block">

          <img
            src="/images/laundry-hero.jpg"
            alt="Laundry"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-blue-600/20 to-blue-700/80" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">

            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 w-fit">
              <div className="flex items-center gap-3">
                <div className="w-18 h-18 rounded-xl bg-blue-600 flex items-center justify-center">
                  <img
                    src="/favicon.ico"
                    alt="Logo"
                    className="w-12 h-12"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    SpinTrack
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Manajemen Laundry Multi-Cabang
                  </p>
                </div>
              </div>
            </div>

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
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4">
                  <p className="font-semibold">Real-time</p>
                  <p className="text-xs text-blue-100 mt-1">
                    Monitoring transaksi
                  </p>
                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4">
                  <p className="font-semibold">Multi Cabang</p>
                  <p className="text-xs text-blue-100 mt-1">
                    Kelola semua outlet
                  </p>
                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4">
                  <p className="font-semibold">Aman</p>
                  <p className="text-xs text-blue-100 mt-1">
                    Data tersimpan aman
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                    <img
                      src="/favicon.ico"
                      alt="Logo"
                      className="w-8 h-8"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      SpinTrack
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manajemen Laundry
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-4xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="text-slate-500 mt-3">
                Masuk ke akun SpinTrack Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Cabang */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Cabang
                </label>

                <select
                  value={form.branch}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      branch: e.target.value,
                    }))
                  }
                    className="
                        w-full
                        h-12
                        px-4
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-200
                        text-slate-900
                        focus:bg-white
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-100
                        outline-none
                      "
                >
                  <option value="">Pilih Cabang</option>

                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label id="email" name="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="email@mylaundry.id"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      email: e.target.value,
                    }))
                  }
                  className="
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    bg-slate-50
                    border
                    border-slate-200
                    text-slate-900
                    placeholder:text-slate-400
                    focus:bg-white
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                    outline-none
                    "
                />
              </div>

              {/* Password */}
              <div>
                <label id="password" name="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        password: e.target.value,
                      }))
                    }
                    className="
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    bg-slate-50
                    border
                    border-slate-200
                    text-slate-900
                    placeholder:text-slate-400
                    focus:bg-white
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-100
                    outline-none
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPw ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all flex items-center justify-center gap-2"
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

            <p className="text-center text-sm text-slate-400 mt-8">
              © 2025 SpinTrack. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}