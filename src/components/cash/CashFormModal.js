"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { BRANCHES } from "@/lib/constants";

export default function CashFormModal({
  open,
  onClose,
  editingCash,
}) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] =
    useState(false);

  const [name, setName] =
    useState("");

  const [branch, setBranch] =
    useState(BRANCHES[0]);

  const [type, setType] =
    useState("in");

  const [amount, setAmount] =
    useState("");

  const [date, setDate] =
    useState(
        new Date()
        .toISOString()
        .split("T")[0]
    );
    useEffect(() => {
    if (!editingCash) return;

    setName(editingCash.name);
    setBranch(editingCash.branch);
    setType(editingCash.type);
    setAmount(editingCash.amount);

    setDate(
        editingCash.created_at
        ?.split("T")[0]
    );
    }, [editingCash]);

  const resetForm = () => {
        setName("");
        setBranch(BRANCHES[0]);
        setType("in");
        setAmount("");

        setDate(
            new Date()
            .toISOString()
            .split("T")[0]
        );
    };

    
  const saveCash = async () => {
    try {
      if (!name.trim()) {
        alert(
          "Nama transaksi wajib diisi"
        );
        return;
      }

      if (
        !amount ||
        Number(amount) <= 0
      ) {
        alert(
          "Nominal tidak valid"
        );
        return;
      }

      setSaving(true);

      const { error } =
        if (editingCash) {
        await supabase
            .from("cash_entries")
            .update({
            name,
            branch,
            type,
            amount:
                Number(amount),
            created_at:
                `${date}T12:00:00`,
            })
            .eq(
            "id",
            editingCash.id
            );
        } else {
        await supabase
            .from("cash_entries")
            .insert({
            name,
            branch,
            type,
            amount:
                Number(amount),
            created_at:
                `${date}T12:00:00`,
            });
        }

      if (error) throw error;

      resetForm();

      onClose();

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Gagal menyimpan transaksi"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
            {editingCash
                ? "Edit Transaksi"
                : "Transaksi Kas"}        
            </h2>

            <p className="text-sm text-slate-500">
              Tambah pemasukan atau
              pengeluaran
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-5">
          <div>
            <label className="mb-1 block font-medium text-slate-600">
              Nama Transaksi
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Contoh: Beli Deterjen"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-600">
              Cabang
            </label>

            <select
              value={branch}
              onChange={(e) =>
                setBranch(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700"
            >
              {BRANCHES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-600">
              Jenis
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700"
            >
              <option value="in">
                Pemasukan
              </option>

              <option value="out">
                Pengeluaran
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-600">
              Nominal
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              placeholder="50000"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700"
            />
          </div>
            <div>
                    <label className="mb-1 block font-medium text-slate-600">
                        Tanggal
                    </label>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) =>
                        setDate(e.target.value)
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        px-4
                        py-3
                        text-slate-700
                        "
                    />
                    </div>
        </div>

        

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-red-600 px-4 py-2 text-red-600 hover:bg-red-600 hover:text-white"
          >
            Batal
          </button>

          <button
            onClick={saveCash}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}