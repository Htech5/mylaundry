import { PDFDocument, StandardFonts } from "pdf-lib";

import { createServerClient } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const start =
      searchParams.get("start");

    const end =
      searchParams.get("end");

    const supabase =
      createServerClient();

    const [
      ordersResult,
      paymentsResult,
      cashResult,
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("*"),

      supabase
        .from("payments")
        .select("*"),

      supabase
        .from("cash_entries")
        .select("*"),
    ]);

    const orders =
      (ordersResult.data || []).filter(
        (item) => {
          const date =
            item.created_at?.split(
              "T"
            )[0];

          return (
            date >= start &&
            date <= end
          );
        }
      );

    const payments =
      (paymentsResult.data ||
        []).filter((item) => {
        const date =
          item.created_at?.split(
            "T"
          )[0];

        return (
          date >= start &&
          date <= end
        );
      });

    const cashEntries =
      (cashResult.data || []).filter(
        (item) => {
          const date =
            item.created_at?.split(
              "T"
            )[0];

          return (
            date >= start &&
            date <= end
          );
        }
      );

    const totalRevenue =
      orders.reduce(
        (sum, item) =>
          sum +
          Number(
            item.total_price || 0
          ),
        0
      );

    const totalPayment =
      payments.reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount_paid || 0
          ),
        0
      );

    const totalCashIn =
      cashEntries
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
      cashEntries
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

    const pdf =
      await PDFDocument.create();

    const page =
      pdf.addPage([595, 842]);

    const font =
      await pdf.embedFont(
        StandardFonts.Helvetica
      );

    let y = 800;

    const drawLine = (
      text,
      size = 12
    ) => {
      page.drawText(text, {
        x: 50,
        y,
        size,
        font,
      });

      y -= size + 8;
    };

    drawLine(
      "LAPORAN SPINTRACK",
      18
    );

    drawLine(
      `Periode: ${start} s/d ${end}`
    );

    y -= 10;

    drawLine(
      `Total Order: ${orders.length}`
    );

    drawLine(
      `Total Omzet: Rp ${totalRevenue.toLocaleString(
        "id-ID"
      )}`
    );

    drawLine(
      `Total Pembayaran: Rp ${totalPayment.toLocaleString(
        "id-ID"
      )}`
    );

    drawLine(
      `Pemasukan Kas: Rp ${totalCashIn.toLocaleString(
        "id-ID"
      )}`
    );

    drawLine(
      `Pengeluaran Kas: Rp ${totalCashOut.toLocaleString(
        "id-ID"
      )}`
    );

    drawLine(
      `Saldo Kas: Rp ${(totalCashIn - totalCashOut).toLocaleString(
        "id-ID"
      )}`
    );

    y -= 20;

    drawLine(
      "DETAIL ORDER",
      14
    );

    orders
      .slice(0, 20)
      .forEach((order) => {
        drawLine(
          `${order.order_number} | ${order.customer_name} | Rp ${Number(
            order.total_price
          ).toLocaleString(
            "id-ID"
          )}`,
          10
        );
      });

    const pdfBytes =
      await pdf.save();

    return new Response(
      pdfBytes,
      {
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="laporan-${start}-${end}.pdf"`,
        },
      }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          "Gagal membuat PDF",
      },
      {
        status: 500,
      }
    );
  }
}