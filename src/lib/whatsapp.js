/**
 * Fonnte WA Bot (https://fonnte.com)
 * Gratis: scan QR dari dashboard Fonnte → dapat token → kirim WA
 * Daftar di fonnte.com, verifikasi nomor WA, ambil token di pengaturan perangkat
 */

const FONNTE_TOKEN = process.env.FONNTE_TOKEN; // set di .env.local

export async function sendWhatsApp(phone, message) {
  if (!FONNTE_TOKEN) {
    console.warn("[WA] FONNTE_TOKEN not set, skipping WA notification");
    return { success: false, reason: "no_token" };
  }

  // Normalisasi nomor: 08xxx → 628xxx
  const normalized = phone
    .replace(/\D/g, "")
    .replace(/^0/, "62");

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: normalized,
        message,
        countryCode: "62",
      }),
    });

    const data = await res.json();
    return { success: data.status, data };
  } catch (err) {
    console.error("[WA] Error sending:", err);
    return { success: false, error: err.message };
  }
}

// Template pesan
export function msgOrderCreated({ orderNumber, customerName, packageType, serviceLabel, totalPrice }) {
  return `Halo *${customerName}* 👋

Pesanan laundry Anda telah diterima!

📋 *No. Pesanan:* ${orderNumber}
📦 *Paket:* ${packageType}
🧺 *Layanan:* ${serviceLabel}
💰 *Total:* Rp ${totalPrice.toLocaleString("id-ID")}

Status saat ini: *PENDING*
Kami akan segera memproses cucian Anda.

Terima kasih telah menggunakan layanan myLaundry 🙏`;
}

export function msgStatusUpdated({ orderNumber, customerName, newStatus }) {
  const statusLabel = {
    pending: "⏳ PENDING",
    process: "🔄 SEDANG DIPROSES",
    done: "✅ SELESAI",
  }[newStatus] || newStatus;

  return `Halo *${customerName}* 👋

Update status pesanan Anda:

📋 *No. Pesanan:* ${orderNumber}
🔖 *Status:* ${statusLabel}

${newStatus === "done" ? "Cucian Anda sudah selesai dan siap diambil! 🎉" : "Kami sedang mengerjakan cucian Anda."}

myLaundry 🧺`;
}

export function msgPaymentReceived({ orderNumber, customerName, amountPaid, remaining }) {
  return `Halo *${customerName}* 👋

Konfirmasi pembayaran diterima:

📋 *No. Pesanan:* ${orderNumber}
💵 *Dibayar:* Rp ${amountPaid.toLocaleString("id-ID")}
${remaining > 0
  ? `💳 *Sisa:* Rp ${remaining.toLocaleString("id-ID")} (Proses Pelunasan)`
  : "✅ *Status:* LUNAS"}

Terima kasih! myLaundry 🧺`;
}