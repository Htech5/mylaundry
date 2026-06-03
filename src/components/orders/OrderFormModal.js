"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  sendWhatsApp,
  msgOrderCreated,
} from "@/lib/whatsapp";

import {
  PACKAGE_TYPES,
  KILOAN_SERVICES,
  SATUAN_SERVICES,
  calcKiloanPrice,
  calcSatuanPrice,
  formatRupiah,
  generateOrderNumber,
} from "@/lib/constants";

export default function OrderFormModal({
  open,
  onClose,
  order = null,
}) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] =
    useState(false);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [packageType, setPackageType] =
    useState("Reguler");

  const [serviceType, setServiceType] =
    useState("kiloan");

  const [serviceId, setServiceId] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [notes, setNotes] =
    useState("");

  const services =
    serviceType === "kiloan"
      ? KILOAN_SERVICES
      : SATUAN_SERVICES;

  useEffect(() => {
    if (!order) return;

    setCustomerName(
      order.customer_name || ""
    );

    setCustomerPhone(
      order.customer_phone || ""
    );

    setPackageType(
      order.package_type || "Reguler"
    );

    setServiceType(
      order.service_type || "kiloan"
    );

    setServiceId(
      order.service_id || ""
    );

    setQuantity(
      order.quantity || 1
    );

    setNotes(
      order.notes || ""
    );
  }, [order]);

  useEffect(() => {
    if (services.length > 0) {
      setServiceId(services[0].id);
    }
  }, [serviceType]);

  const selectedService =
    services.find(
      (service) =>
        service.id === serviceId
    ) || null;

  const pricePerUnit = useMemo(() => {
    if (!selectedService) return 0;

    return packageType === "Express"
      ? selectedService.express
      : selectedService.reguler;
  }, [
    selectedService,
    packageType,
  ]);

  const totalPrice = useMemo(() => {
    if (serviceType === "kiloan") {
      return calcKiloanPrice(
        serviceId,
        packageType,
        quantity
      );
    }

    return calcSatuanPrice(
      serviceId,
      packageType,
      quantity
    );
  }, [
    serviceType,
    serviceId,
    packageType,
    quantity,
  ]);

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setPackageType("Reguler");
    setServiceType("kiloan");
    setQuantity(1);
    setNotes("");
  };

  const saveOrder = async () => {
    try {
      if (!customerName.trim()) {
        alert(
          "Nama pelanggan wajib diisi"
        );
        return;
      }

      if (!customerPhone.trim()) {
        alert(
          "Nomor WhatsApp wajib diisi"
        );
        return;
      }

      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert(
          "Session login tidak ditemukan"
        );
        return;
      }

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("branch")
          .eq("id", user.id)
          .single();

      const branch =
        profile?.branch;

      const { count } =
        await supabase
          .from("orders")
          .select("*", {
            count: "exact",
            head: true,
          });

      const branchCode =
        branch
          ?.substring(0, 3)
          ?.toUpperCase() || "SPN";

      const orderNumber =
        generateOrderNumber(
          branchCode,
          (count || 0) + 1
        );

      let customerId = null;

      const {
        data: existingCustomer,
      } = await supabase
        .from("customers")
        .select("id")
        .eq(
          "phone",
          customerPhone
        )
        .maybeSingle();

      if (existingCustomer) {
        customerId =
          existingCustomer.id;
      } else {
        const {
          data: newCustomer,
          error: customerError,
        } = await supabase
          .from("customers")
          .insert({
            branch,
            name: customerName,
            phone: customerPhone,
          })
          .select()
          .single();

        if (customerError)
          throw customerError;

        customerId =
          newCustomer.id;
      }

      let orderError;

      if (order) {
        const result =
          await supabase
            .from("orders")
            .update({
              customer_name:
                customerName,

              customer_phone:
                customerPhone,

              package_type:
                packageType,

              service_type:
                serviceType,

              service_id:
                serviceId,

              service_label:
                selectedService?.label ||
                "",

              quantity:
                Number(quantity),

              unit:
                serviceType ===
                "kiloan"
                  ? "kg"
                  : "pcs",

              price_per_unit:
                Number(pricePerUnit),

              total_price:
                Number(totalPrice),

              notes,
            })
            .eq("id", order.id);

        orderError =
          result.error;
      } else {
        const result =
          await supabase
            .from("orders")
            .insert({
              order_number:
                orderNumber,

              branch,

              customer_id:
                customerId,

              customer_name:
                customerName,

              customer_phone:
                customerPhone,

              package_type:
                packageType,

              service_type:
                serviceType,

              service_id:
                serviceId,

              service_label:
                selectedService?.label ||
                "",

              quantity:
                Number(quantity),

              unit:
                serviceType ===
                "kiloan"
                  ? "kg"
                  : "pcs",

              price_per_unit:
                Number(pricePerUnit),

              total_price:
                Number(totalPrice),

              wash_status:
                "pending",

              payment_status:
                "unpaid",

              amount_paid: 0,

              notes,
            });

        orderError =
          result.error;

        if (!orderError) {
          sendWhatsApp(
            customerPhone,
            msgOrderCreated({
              orderNumber,
              customerName,
              packageType,
              serviceLabel:
                selectedService?.label ||
                "",
              totalPrice,
            })
          ).catch(console.error);
        }
      }

      if (orderError)
        throw orderError;

    // Kirim WhatsApp otomatis
    sendWhatsApp(
      customerPhone,
      msgOrderCreated({
        orderNumber,
        customerName,
        packageType,
        serviceLabel:
          selectedService?.label || "",
        totalPrice,
      })
    ).catch((err) =>
      console.error(
        "WhatsApp Error:",
        err
      )
    );

    resetForm();

    onClose();

    router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Gagal menyimpan pesanan"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] !mt-0 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
          <h2 className="text-xl font-bold text-slate-800">
            {order
              ? "Edit Pesanan"
              : "Tambah Pesanan"}
          </h2>

            <p className="text-sm text-slate-500">
              Buat transaksi laundry
              baru
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
        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          <div>
            <label className="mb-1 block text-slate-600 font-medium">
              Nama Pelanggan
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 font-medium"
            />
          </div>

          <div>
            <label className="mb-1 block text-slate-600 font-medium">
              Nomor WhatsApp
            </label>

            <input
              type="text"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 font-medium"
            />
          </div>

          <div>
            <label className="mb-1 block text-slate-600 font-medium">
              Paket
            </label>

            <select
              value={packageType}
              onChange={(e) =>
                setPackageType(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 font-medium"
            >
              {PACKAGE_TYPES.map(
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
            <label className="mb-1 block text-slate-600 font-medium">
              Jenis Layanan
            </label>

            <select
              value={serviceType}
              onChange={(e) =>
                setServiceType(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 font-medium"
            >
              <option value="kiloan">
                Kiloan
              </option>

              <option value="satuan">
                Satuan
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-slate-600 font-medium">
              Layanan
            </label>

            <select
              value={serviceId}
              onChange={(e) =>
                setServiceId(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 font-medium"
            >
              {services.map(
                (service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-slate-600 font-medium">
              {serviceType ===
              "kiloan"
                ? "Berat (Kg)"
                : "Jumlah"}
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Harga Satuan
              </p>

              <p className="mt-2 font-semibold text-slate-500">
                {formatRupiah(
                  pricePerUnit
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Total
              </p>

              <p className="mt-2 text-xl font-bold text-blue-700">
                {formatRupiah(
                  totalPrice
                )}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-slate-600 font-medium">
              Catatan
            </label>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-600 font-medium"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
          <button
            onClick={onClose}
            className="rounded-xl border border-red-600 px-4 py-2 text-red-600 hover:bg-red-600 hover:text-white  "
          >
            Batal
          </button>

          <button
            onClick={saveOrder}
            disabled={saving}
            className="
              rounded-xl
              bg-blue-600
              px-5 py-2
              text-white
              hover:bg-blue-700
              disabled:opacity-50
            "
          >
            {saving
              ? "Menyimpan..."
              : order
              ? "Simpan Perubahan"
              : "Simpan Pesanan"}
          </button>
        </div>
      </div>
    </div>
  );
}