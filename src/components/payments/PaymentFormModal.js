"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  formatRupiah,
} from "@/lib/constants";

import {
  sendWhatsApp,
  msgPaymentReceived,
} from "@/lib/whatsapp";

export default function PaymentFormModal({
  open,
  orders = [],
  onClose,
}) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] =
    useState(false);

  const [orderId, setOrderId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");

  const selectedOrder =
    useMemo(() => {
      return (
        orders.find(
          (o) => o.id === orderId
        ) || null
      );
    }, [orders, orderId]);

  const totalPrice =
    Number(
      selectedOrder?.total_price || 0
    );

  const amountPaid =
    Number(
      selectedOrder?.amount_paid || 0
    );

  const remaining =
    totalPrice - amountPaid;

  const resetForm = () => {
    setOrderId("");
    setAmount("");
    setNote("");
  };

  const savePayment = async () => {
    try {
      if (!orderId) {
        alert(
          "Pilih pesanan terlebih dahulu"
        );
        return;
      }

      if (
        !amount ||
        Number(amount) <= 0
      ) {
        alert(
          "Nominal pembayaran tidak valid"
        );
        return;
      }

      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Session tidak ditemukan"
        );
      }

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("branch")
          .eq("id", user.id)
          .single();

      const branch =
        profile?.branch;

      // Simpan pembayaran
      const {
        error: paymentError,
      } = await supabase
        .from("payments")
        .insert({
          branch,
          order_id:
            selectedOrder.id,
          order_number:
            selectedOrder.order_number,
          customer_name:
            selectedOrder.customer_name,
          amount:
            Number(amount),
          note,
        });

      if (paymentError)
        throw paymentError;

      const newAmountPaid =
        amountPaid +
        Number(amount);

      let paymentStatus =
        "unpaid";

      if (
        newAmountPaid >=
        totalPrice
      ) {
        paymentStatus = "paid";
      } else if (
        newAmountPaid > 0
      ) {
        paymentStatus =
          "partial";
      }

      // Update order
      const {
        error: orderError,
      } = await supabase
        .from("orders")
        .update({
          amount_paid:
            newAmountPaid,
          payment_status:
            paymentStatus,
        })
        .eq(
          "id",
          selectedOrder.id
        );

      if (orderError)
        throw orderError;

      // Kirim WA
      sendWhatsApp(
        selectedOrder.customer_phone,
        msgPaymentReceived({
          orderNumber:
            selectedOrder.order_number,
          customerName:
            selectedOrder.customer_name,
          amountPaid:
            Number(amount),
          remaining:
            Math.max(
              0,
              totalPrice -
                newAmountPaid
            ),
        })
      ).catch(console.error);

      resetForm();

      onClose();

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Gagal menyimpan pembayaran"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] !mt-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Pembayaran Baru
            </h2>

            <p className="text-sm text-slate-500">
              Catat pembayaran pelanggan
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
          {/* Order */}
          <div>
            <label className="mb-1 block font-medium text-slate-600">
              Nomor Order
            </label>

            <select
              value={orderId}
              onChange={(e) =>
                setOrderId(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 !text-slate-600 !font-medium"
            >
              <option value="" className="!text-slate-700">
                Pilih Order
              </option>

              {orders.map(
                (order) => (
                  <option
                    key={order.id}
                    value={order.id}
                  >
                    {
                      order.order_number
                    }{" "}
                    -{" "}
                    {
                      order.customer_name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {selectedOrder && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Total
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {formatRupiah(
                      totalPrice
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs text-slate-500">
                    Dibayar
                  </p>

                  <p className="mt-1 font-bold text-blue-700">
                    {formatRupiah(
                      amountPaid
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-xs text-slate-500">
                    Sisa
                  </p>

                  <p className="mt-1 font-bold text-red-700">
                    {formatRupiah(
                      remaining
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">
                  Nominal Pembayaran
                </label>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-600">
                  Catatan
                </label>

                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) =>
                    setNote(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 font-medium"
                />
              </div>
            </>
          )}
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
            onClick={savePayment}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Pembayaran"}
          </button>
        </div>
      </div>
    </div>
  );
}