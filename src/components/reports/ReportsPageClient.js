"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  ShoppingBag,
  CreditCard,
  Wallet,
  Download,
} from "lucide-react";

export default function ReportsPageClient({
  orders = [],
  payments = [],
  cashEntries = [],
}) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] =
    useState(today);

  const [endDate, setEndDate] =
    useState(today);

  const filteredOrders =
    useMemo(() => {
      return orders.filter((item) => {
        const date =
          item.created_at?.split(
            "T"
          )[0];

        return (
          date >= startDate &&
          date <= endDate
        );
      });
    }, [
      orders,
      startDate,
      endDate,
    ]);

  const filteredPayments =
    useMemo(() => {
      return payments.filter(
        (item) => {
          const date =
            item.created_at?.split(
              "T"
            )[0];

          return (
            date >= startDate &&
            date <= endDate
          );
        }
      );
    }, [
      payments,
      startDate,
      endDate,
    ]);

  const filteredCash =
    useMemo(() => {
      return cashEntries.filter(
        (item) => {
          const date =
            item.created_at?.split(
              "T"
            )[0];

          return (
            date >= startDate &&
            date <= endDate
          );
        }
      );
    }, [
      cashEntries,
      startDate,
      endDate,
    ]);

  const totalOrders =
    filteredOrders.length;

  const totalRevenue =
    filteredOrders.reduce(
      (sum, item) =>
        sum +
        Number(
          item.total_price || 0
        ),
      0
    );

  const totalPayment =
    filteredPayments.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount_paid || 0
        ),
      0
    );

  const totalCashIn =
    filteredCash
      .filter(
        (item) =>
          item.type === "in"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

  const totalCashOut =
    filteredCash
      .filter(
        (item) =>
          item.type === "out"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

  const cashBalance =
    totalCashIn -
    totalCashOut;

  const regularCount =
    filteredOrders.filter(
      (o) =>
        o.package_type ===
        "Reguler"
    ).length;

  const expressCount =
    filteredOrders.filter(
      (o) =>
        o.package_type ===
        "Express"
    ).length;

  const pendingCount =
    filteredOrders.filter(
      (o) =>
        o.wash_status ===
        "pending"
    ).length;

  const processCount =
    filteredOrders.filter(
      (o) =>
        o.wash_status ===
        "process"
    ).length;

  const doneCount =
    filteredOrders.filter(
      (o) =>
        o.wash_status === "done"
    ).length;

  const paidCount =
    filteredOrders.filter(
      (o) =>
        o.payment_status ===
        "paid"
    ).length;

  const unpaidCount =
    filteredOrders.filter(
      (o) =>
        o.payment_status !==
        "paid"
    ).length;

  const downloadPdf = () => {
    window.open(
      `/api/reports/pdf?start=${startDate}&end=${endDate}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Laporan
            </h1>

            <p className="text-sm text-slate-500">
              Seluruh cabang
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-slate-700"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 px-4 py-3 text-slate-700"
          />

          <button
            onClick={downloadPdf}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-white hover:bg-red-700"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Total Order"
          value={totalOrders}
          icon={<ShoppingBag />}
        />

        <Card
          title="Omzet"
          value={`Rp ${totalRevenue.toLocaleString(
            "id-ID"
          )}`}
          icon={<CreditCard />}
        />

        <Card
          title="Pembayaran"
          value={`Rp ${totalPayment.toLocaleString(
            "id-ID"
          )}`}
          icon={<Wallet />}
        />

        <Card
          title="Saldo Kas"
          value={`Rp ${cashBalance.toLocaleString(
            "id-ID"
          )}`}
          icon={<Wallet />}
        />
      </div>

      {/* Statistik */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-bold text-slate-800">
            Statistik Order
          </h3>

          <div className="space-y-2 text-slate-700">
            <p>
              Reguler :
              {" "}
              {regularCount}
            </p>

            <p>
              Express :
              {" "}
              {expressCount}
            </p>

            <p>
              Pending :
              {" "}
              {pendingCount}
            </p>

            <p>
              Proses :
              {" "}
              {processCount}
            </p>

            <p>
              Selesai :
              {" "}
              {doneCount}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-bold text-slate-800">
            Statistik Pembayaran
          </h3>

          <div className="space-y-2 text-slate-700">
            <p>
              Lunas :
              {" "}
              {paidCount}
            </p>

            <p>
              Belum Lunas :
              {" "}
              {unpaidCount}
            </p>

            <p>
              Pemasukan Kas :
              {" "}
              Rp{" "}
              {totalCashIn.toLocaleString(
                "id-ID"
              )}
            </p>

            <p>
              Pengeluaran Kas :
              {" "}
              Rp{" "}
              {totalCashOut.toLocaleString(
                "id-ID"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b p-4">
          <h3 className="font-bold text-slate-800">
            Detail Order
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left">
                  No Order
                </th>

                <th className="px-4 py-3 text-left">
                  Cabang
                </th>

                <th className="px-4 py-3 text-left">
                  Pelanggan
                </th>

                <th className="px-4 py-3 text-left">
                  Paket
                </th>

                <th className="px-4 py-3 text-left">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {
                        item.order_number
                      }
                    </td>

                    <td className="px-4 py-3">
                      {item.branch}
                    </td>

                    <td className="px-4 py-3">
                      {
                        item.customer_name
                      }
                    </td>

                    <td className="px-4 py-3">
                      {
                        item.package_type
                      }
                    </td>

                    <td className="px-4 py-3">
                      Rp{" "}
                      {Number(
                        item.total_price
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {title}
        </p>

        {icon}
      </div>

      <h3 className="mt-3 text-2xl font-bold text-slate-800">
        {value}
      </h3>
    </div>
  );
}