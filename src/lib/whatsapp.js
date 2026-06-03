// =====================================================
// WhatsApp Helper
// Menggunakan API internal:
// POST /api/whatsapp
// =====================================================

export async function sendWhatsApp(
  phone,
  message
) {
  try {
    const response = await fetch(
      "/api/whatsapp",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          phone,
          message,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error(
      "[WA_ERROR]",
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }
}

// =====================================================
// Pesan saat order dibuat
// =====================================================

export function msgOrderCreated({
  orderNumber,
  customerName,
  packageType,
  serviceLabel,
  totalPrice,
}) {
  return `Halo *${customerName}* 👋

Pesanan laundry Anda telah diterima.

📋 *No. Pesanan:* ${orderNumber}
📦 *Paket:* ${packageType}
🧺 *Layanan:* ${serviceLabel}
💰 *Total:* Rp ${Number(
    totalPrice
  ).toLocaleString("id-ID")}

⏳ *Status:* PENDING

Kami akan segera memproses cucian Anda.

Terima kasih telah menggunakan layanan *SpinTrack* 🙏`;
}

// =====================================================
// Pesan saat status berubah
// =====================================================

export function msgStatusUpdated({
  orderNumber,
  customerName,
  newStatus,
}) {
  const statusLabel = {
    pending: "⏳ PENDING",
    process:
      "🔄 SEDANG DIPROSES",
    done: "✅ SELESAI",
  };

  const statusText =
    statusLabel[newStatus] ||
    newStatus;

  return `Halo *${customerName}* 👋

Ada pembaruan status untuk pesanan Anda.

📋 *No. Pesanan:* ${orderNumber}
🔖 *Status:* ${statusText}

${
  newStatus === "done"
    ? "🎉 Cucian Anda telah selesai dan siap diambil."
    : "Kami sedang mengerjakan cucian Anda."
}

Terima kasih telah menggunakan *SpinTrack* 🙏`;
}

// =====================================================
// Pesan saat pembayaran diterima
// =====================================================

export function msgPaymentReceived({
  orderNumber,
  customerName,
  amountPaid,
  remaining,
}) {
  return `Halo *${customerName}* 👋

Pembayaran berhasil kami terima.

📋 *No. Pesanan:* ${orderNumber}
💵 *Dibayar:* Rp ${Number(
    amountPaid
  ).toLocaleString("id-ID")}

${
  remaining > 0
    ? `💳 *Sisa Tagihan:* Rp ${Number(
        remaining
      ).toLocaleString(
        "id-ID"
      )}`
    : "✅ *Status Pembayaran:* LUNAS"
}

Terima kasih telah menggunakan *SpinTrack* 🙏`;
}