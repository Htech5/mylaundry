"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Wallet } from "lucide-react";

import PaymentFormModal from "./PaymentFormModal";

export default function PaymentsPageClient({
  payments = [],
  orders = [],
  branch,
}) {
  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const filteredPayments =
    useMemo(() => {
      if (!search) return payments;

      return payments.filter(
        (payment) =>
          [
            payment.order_number,
            payment.customer_name,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [payments, search]);

  const totalPayments =
    payments.reduce(
      (sum, item) =>
        sum +
        Number(item.amount || 0),
      0
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Pembayaran
            </h1>

            <p className="text-sm text-slate-500">
              Cabang {branch}
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
            Pembayaran Baru
          </button>
        </div>
      </div>

      {/* Stat */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Transaksi
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-800">
            {payments.length}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Pembayaran
          </p>

          <h3 className="mt-2 text-3xl font-bold text-green-700">
            Rp{" "}
            {totalPayments.toLocaleString(
              "id-ID"
            )}
          </h3>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Cari nomor order atau pelanggan..."
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
              text-slate-600
              outline-none
              focus:border-blue-500
            "
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-left text-slate-600">
                  No Order
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Pelanggan
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Nominal
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Catatan
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Tanggal
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-16 text-center text-slate-500"
                  >
                    <Wallet className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                    Belum ada pembayaran
                  </td>
                </tr>
              ) : (
                filteredPayments.map(
                  (payment) => (
                    <tr
                      key={payment.id}
                      className="border-b text-slate-700 last:border-0"
                    >
                      <td className="px-4 py-3">
                        {
                          payment.order_number
                        }
                      </td>

                      <td className="px-4 py-3">
                        {
                          payment.customer_name
                        }
                      </td>

                      <td className="px-4 py-3 font-medium text-green-700">
                        Rp{" "}
                        {Number(
                          payment.amount
                        ).toLocaleString(
                          "id-ID"
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {payment.note ||
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        {new Date(
                          payment.created_at
                        ).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentFormModal
        open={showModal}
        orders={orders}
        onClose={() =>
          setShowModal(false)
        }
      />
    </div>
  );
}