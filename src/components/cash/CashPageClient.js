"use client";
import { createClient }
from "@/lib/supabase/client";

import { useRouter }
from "next/navigation";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import CashFormModal from "./CashFormModal";

export default function CashPageClient({
  cashEntries = [],
}) {
  const [search, setSearch] =
    useState("");

  const supabase =
    createClient();

  const router =
    useRouter();

  const [showModal, setShowModal] =
    useState(false);

  const [editingCash, setEditingCash] =
    useState(null);

  const filteredEntries =
    useMemo(() => {
      if (!search) return cashEntries;

      return cashEntries.filter(
        (item) =>
          [
            item.name,
            item.branch,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [cashEntries, search]);

  const totalIncome =
    cashEntries
      .filter(
        (item) => item.type === "in"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.amount || 0),
        0
      );

  const totalExpense =
    cashEntries
      .filter(
        (item) => item.type === "out"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.amount || 0),
        0
      );

  const balance =
    totalIncome - totalExpense;

    const deleteCash = async (id) => {
    const confirmDelete =
        confirm(
        "Hapus transaksi ini?"
        );

    if (!confirmDelete) return;

    const { error } =
        await supabase
        .from("cash_entries")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    router.refresh();
    };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Kas
            </h1>

            <p className="text-sm text-slate-500">
              Seluruh transaksi kas
              semua cabang
            </p>
          </div>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="
              flex items-center gap-2
              rounded-xl
              bg-blue-600
              px-4 py-2.5
              font-medium
              text-white
              hover:bg-blue-700
            "
          >
            <Plus className="h-4 w-4" />
            Transaksi Baru
          </button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Pemasukan
          </p>

          <h3 className="mt-2 text-2xl font-bold text-green-700">
            Rp{" "}
            {totalIncome.toLocaleString(
              "id-ID"
            )}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Pengeluaran
          </p>

          <h3 className="mt-2 text-2xl font-bold text-red-700">
            Rp{" "}
            {totalExpense.toLocaleString(
              "id-ID"
            )}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Saldo
          </p>

          <h3 className="mt-2 text-2xl font-bold text-blue-700">
            Rp{" "}
            {balance.toLocaleString(
              "id-ID"
            )}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Jumlah Transaksi
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-800">
            {cashEntries.length}
          </h3>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Cari transaksi atau cabang..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              py-3
              pl-10
              pr-4
              text-slate-700
              outline-none
              focus:border-blue-500
            "
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-left text-slate-600">
                  Tanggal
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Cabang
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Nama
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Jenis
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Nominal
                </th>
                <th className="px-4 py-3 text-left text-slate-600">
                Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEntries.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-16 text-center text-slate-500"
                  >
                    <Wallet className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                    Belum ada transaksi kas
                  </td>
                </tr>
              ) : (
                filteredEntries.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b"
                    >
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(
                          item.created_at
                        ).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {item.branch}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {item.name}
                      </td>

                      <td className="px-4 py-3">
                        {item.type ===
                        "in" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            <TrendingUp className="h-3 w-3" />
                            Pemasukan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            <TrendingDown className="h-3 w-3" />
                            Pengeluaran
                          </span>
                        )}
                      </td>

                      <td
                        className={`px-4 py-3 font-semibold ${
                          item.type ===
                          "in"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        Rp{" "}
                        {Number(
                          item.amount
                        ).toLocaleString(
                          "id-ID"
                        )}
                      </td>
                    <td className="px-4 py-3">
                    <div className="flex gap-2">
                        <button
                        onClick={() =>
                            setEditingCash(item)
                        }
                        className="
                            rounded-lg
                            bg-blue-50
                            px-3
                            py-1
                            text-sm
                            text-blue-600
                            hover:bg-blue-100
                        "
                        >
                        Edit
                        </button>

                        <button
                        onClick={() =>
                            deleteCash(item.id)
                        }
                        className="
                            rounded-lg
                            bg-red-50
                            px-3
                            py-1
                            text-sm
                            text-red-600
                            hover:bg-red-100
                        "
                        >
                        Hapus
                        </button>
                    </div>
                    </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

        <CashFormModal
        open={
            showModal ||
            !!editingCash
        }
        editingCash={editingCash}
        onClose={() => {
            setShowModal(false);
            setEditingCash(null);
        }}
        />
    </div>
  );
}