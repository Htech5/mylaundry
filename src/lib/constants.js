// Daftar cabang
export const BRANCHES = ["Semarang", "Jakarta", "Surabaya", "Bandung"];

// Jenis paket utama
export const PACKAGE_TYPES = ["Reguler", "Express"];

// Layanan KILOAN
export const KILOAN_SERVICES = [
  { id: "cuci_kering_setrika", label: "Cuci Kering Setrika", reguler: 6000, express: 12000 },
  { id: "cuci_kering_lipat",   label: "Cuci Kering Lipat",   reguler: 5000, express: 10000 },
  { id: "setrika",             label: "Setrika",              reguler: 4000, express: 8000  },
];

// Layanan SATUAN
export const SATUAN_SERVICES = [
  { id: "bed_cover_kecil",   label: "Bed Cover Kecil",    reguler: 15000, express: 30000 },
  { id: "bed_cover_sedang",  label: "Bed Cover Sedang",   reguler: 25000, express: 50000 },
  { id: "bed_cover_besar",   label: "Bed Cover Besar",    reguler: 35000, express: 70000 },
  { id: "boneka_kecil",      label: "Boneka Kecil",       reguler: 8000,  express: 16000 },
  { id: "boneka_sedang",     label: "Boneka Sedang",      reguler: 15000, express: 30000 },
  { id: "boneka_besar",      label: "Boneka Besar",       reguler: 30000, express: 60000 },
  { id: "selimut_kecil",     label: "Selimut Kecil",      reguler: 7000,  express: 14000 },
  { id: "selimut_sedang",    label: "Selimut Sedang",     reguler: 8000,  express: 16000 },
  { id: "selimut_besar",     label: "Selimut Besar",      reguler: 10000, express: 20000 },
  { id: "sprei_double_bed",  label: "Sprei Double Bed",   reguler: 6000,  express: 12000 },
  { id: "sprei_king_size",   label: "Sprei King Size",    reguler: 9000,  express: 18000 },
  { id: "sleeping_bed",      label: "Sleeping Bed",       reguler: 15000, express: 30000 },
];

// Status cucian
export const WASH_STATUSES = [
  { value: "pending",  label: "Pending",  color: "badge-pending" },
  { value: "process",  label: "Proses",   color: "badge-process" },
  { value: "done",     label: "Selesai",  color: "badge-done"    },
];

// Status pembayaran
export const PAYMENT_STATUSES = [
  { value: "unpaid",   label: "Belum Lunas",      color: "badge-unpaid"  },
  { value: "partial",  label: "Proses Pelunasan", color: "badge-partial" },
  { value: "paid",     label: "Lunas",            color: "badge-paid"    },
];

// Helper: hitung harga kiloan
export function calcKiloanPrice(serviceId, packageType, kg) {
  const svc = KILOAN_SERVICES.find((s) => s.id === serviceId);
  if (!svc) return 0;
  const pricePerKg = packageType === "Express" ? svc.express : svc.reguler;
  return pricePerKg * (parseFloat(kg) || 0);
}

// Helper: hitung harga satuan
export function calcSatuanPrice(serviceId, packageType, qty) {
  const svc = SATUAN_SERVICES.find((s) => s.id === serviceId);
  if (!svc) return 0;
  const price = packageType === "Express" ? svc.express : svc.reguler;
  return price * (parseInt(qty) || 0);
}

// Format Rupiah
export function formatRupiah(amount) {
  if (!amount && amount !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Generate nomor pesanan
export function generateOrderNumber(branchCode, sequence) {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");
  return `${branchCode}-${yy}${mm}${dd}-${seq}`;
}
