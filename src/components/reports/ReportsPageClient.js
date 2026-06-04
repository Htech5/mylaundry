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

  const branchSummary =
    filteredOrders.reduce(
        (acc, order) => {
        const branch =
            order.branch ||
            "Unknown";

        if (!acc[branch]) {
            acc[branch] = {
            orders: 0,
            omzet: 0,
            };
        }

        acc[branch].orders += 1;

        acc[branch].omzet += Number(
            order.total_price || 0
        );

        return acc;
        },
        {}
    );
    
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
    console.log("ORDERS", orders);
    console.log("FILTERED", filteredOrders);
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
          title="Omzet"
          value={`Rp ${totalRevenue.toLocaleString(
            "id-ID"
          )}`}
          icon={<CreditCard />}
        />


        <Card
          title="Saldo Kas"
          value={`Rp ${cashBalance.toLocaleString(
            "id-ID"
          )}`}
          icon={<Wallet />}
        />
      </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b p-4">
            <h3 className="font-bold text-slate-800">
            Detail Kas
            </h3>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
                <tr className="bg-slate-50">
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
                </tr>
            </thead>

            <tbody>
                {filteredCash.map(
                (item) => (
                    <tr
                    key={item.id}
                    className="border-t"
                    >
                    <td className="px-4 py-3 !text-slate-700    ">
                        {new Date(
                        item.created_at
                        ).toLocaleDateString(
                        "id-ID"
                        )}
                    </td>

                    <td className="px-4 py-3 !text-slate-700">
                        {item.branch}
                    </td>

                    <td className="px-4 py-3 !text-slate-700">
                        {item.name}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                        {item.type === "in"
                        ? "Pemasukan"
                        : "Pengeluaran"}
                    </td>

                    <td className="px-4 py-3 !text-slate-700">
                        Rp{" "}
                        {Number(
                        item.amount
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