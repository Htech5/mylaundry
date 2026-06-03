import { NextResponse } from "next/server";

const FONNTE_TOKEN = process.env.FONNTE_TOKEN;

export async function POST(request) {
  try {
    if (!FONNTE_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          message: "FONNTE_TOKEN belum diset",
        },
        { status: 500 }
      );
    }

    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "phone dan message wajib diisi",
        },
        { status: 400 }
      );
    }

    // Normalisasi nomor
    const normalized = phone
      .replace(/\D/g, "")
      .replace(/^0/, "62");

    const response = await fetch(
      "https://api.fonnte.com/send",
      {
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
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "[WHATSAPP_API_ERROR]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}