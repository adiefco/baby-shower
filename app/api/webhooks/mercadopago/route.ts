import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import MercadoPago, { Payment } from "mercadopago";
import { updateContributionStatus } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!secret || !accessToken) return NextResponse.json({ error: "Não configurado" }, { status: 503 });

  const signature = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(signature.split(",").map((part) => part.trim().split("=")));
  const dataId = req.nextUrl.searchParams.get("data.id") ?? req.nextUrl.searchParams.get("data_id");
  if (!dataId || !requestId || !parts.ts || !/^[a-f0-9]{64}$/i.test(parts.v1 ?? "")) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  if (!timingSafeEqual(expected, Buffer.from(parts.v1, "hex"))) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (body.type !== "payment" && body.topic !== "payment") return NextResponse.json({ received: true });
    if (String(body.data?.id ?? body.id) !== dataId) {
      return NextResponse.json({ error: "ID divergente" }, { status: 400 });
    }
    const payment = await new Payment(new MercadoPago({ accessToken })).get({ id: dataId });
    if (!payment.external_reference || !payment.id || !payment.transaction_amount || payment.currency_id !== "BRL") {
      return NextResponse.json({ received: true });
    }
    if (payment.status === "approved" || payment.status === "rejected" || payment.status === "cancelled") {
      await updateContributionStatus(
        payment.external_reference,
        payment.status === "approved" ? "approved" : "rejected",
        String(payment.id),
        payment.transaction_amount
      );
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Falha ao processar notificação" }, { status: 500 });
  }
}
