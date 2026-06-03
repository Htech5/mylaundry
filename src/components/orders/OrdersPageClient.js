"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import {
  sendWhatsApp,
  msgStatusUpdated,
} from "@/lib/whatsapp";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
} from "lucide-react";

import OrderFormModal from "./OrderFormModal";

export default function OrdersPageClient({
  orders = [],
  branch,
}) {
  const [search, setSearch] = useState("");
  const [editingOrder, setEditingOrder] =
      useState(null);
  const router = useRouter();
  const supabase = createClient();

  const [showModal, setShowModal] =
    useState(false);

  const filteredOrders = useMemo(() => {
    if (!search) return orders;

    return orders.filter((order) =>
      [
        order.order_number,
        order.customer_name,
        order.customer_phone,
        order.service_label,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [orders, search]);

  const totalOrders = orders.length;

  const pendingOrders =
    orders.filter(
      (o) => o.wash_status === "pending"
    ).length;

  const processOrders =
    orders.filter(
      (o) => o.wash_status === "process"
    ).length;

  const doneOrders =
    orders.filter(
      (o) => o.wash_status === "done"
    ).length;
    
  const updateStatus = async (
    order,
    newStatus
  ) => {
    try {
      const { error } =
        await supabase
          .from("orders")
          .update({
            wash_status: newStatus,
          })
          .eq("id", order.id);

      if (error) throw error;

      sendWhatsApp(
        order.customer_phone,
        msgStatusUpdated({
          orderNumber:
            order.order_number,
          customerName:
            order.customer_name,
          newStatus,
        })
      ).catch(console.error);

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        "Gagal mengubah status"
      );
    }
  };

  const deleteOrder = async (
    orderId
  ) => {
    const ok = confirm(
      "Hapus pesanan ini?"
    );

    if (!ok) return;

    try {
      const { error } =
        await supabase
          .from("orders")
          .delete()
          .eq("id", orderId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Gagal menghapus pesanan"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Pesanan
            </h1>

            <p className="text-sm text-slate-500">
              Cabang {branch}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="
              flex items-center gap-2
              rounded-xl
              bg-blue-600
              px-4 py-2.5
              font-medium
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <Plus className="h-4 w-4" />
            Pesanan Baru
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Pesanan
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-800">
            {totalOrders}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-yellow-700">
            Pending
          </p>

          <h3 className="mt-2 text-3xl font-bold text-yellow-700">
            {pendingOrders}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-blue-700">
            Proses
          </p>

          <h3 className="mt-2 text-3xl font-bold text-blue-700">
            {processOrders}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-green-700">
            Selesai
          </p>

          <h3 className="mt-2 text-3xl font-bold text-green-700">
            {doneOrders}
          </h3>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Cari pelanggan, nomor pesanan, layanan..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              py-3
              pl-10
              pr-4
              outline-none
              focus:border-blue-500
              text-slate-600
            "
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-left text-slate-600">
                  No Order
                </th>

                <th className="px-4 py-3 text-left text-slate-600 ">
                  Pelanggan
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  WhatsApp
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Layanan
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Paket
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Qty
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Total
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Bayar
                </th>

                <th className="px-4 py-3 text-left text-slate-600">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="py-16 text-center text-slate-500"
                  >
                    <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    Belum ada pesanan
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {order.order_number}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {order.customer_name}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {order.customer_phone}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {order.service_label}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {order.package_type}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-slate-800">
                      {order.quantity}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      Rp{" "}
                      {Number(
                        order.total_price
                      ).toLocaleString("id-ID")}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={order.wash_status}
                        onChange={(e) =>
                          updateStatus(
                            order,
                            e.target.value
                          )
                        }
                        className="
                          rounded-lg
                          border
                          border-slate-200
                          px-3 py-2
                          text-sm
                          text-slate-700
                        "
                      >
                        <option value="pending">
                          Pending
                        </option>

                        <option value="process">
                          Proses
                        </option>

                        <option value="done">
                          Selesai
                        </option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          order.payment_status ===
                          "paid"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {order.payment_status ===
                        "paid"
                          ? "Lunas"
                          : "Belum"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditingOrder(order)
                          }
                          className="
                            rounded-lg
                            bg-blue-600
                            px-3 py-1
                            text-sm
                            text-white
                          "
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteOrder(order.id)
                          }
                          className="
                            rounded-lg
                            bg-red-600
                            px-3 py-1
                            text-sm
                            text-white
                          "
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderFormModal
        open={
          showModal ||
          !!editingOrder
        }
        order={editingOrder}
        onClose={() => {
          setShowModal(false);
          setEditingOrder(null);
        }}
      />
    </div>
  );
}