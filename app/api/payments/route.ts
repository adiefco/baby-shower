import { NextRequest, NextResponse } from "next/server";
import MercadoPago, { Preference } from "mercadopago";
import { v4 as uuidv4 } from "uuid";
import { getItem, addContribution } from "@/lib/db";
import { CreatePaymentBody } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (!accessToken || !baseUrl || !/^https:\/\//.test(baseUrl)) {
      return NextResponse.json({ error: "Pagamento não configurado" }, { status: 503 });
    }
    const preference = new Preference(new MercadoPago({ accessToken }));
    const body: CreatePaymentBody = await req.json();
    const { itemId, guestName, message } = body;

    if (typeof itemId !== "string" || typeof guestName !== "string" ||
        !guestName.trim() || guestName.length > 100 ||
        (message != null && (typeof message !== "string" || message.length > 1000))) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const item = await getItem(itemId);
    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    if (item.limit !== -1 && item.bought >= item.limit) {
      return NextResponse.json(
        { error: "Este item já foi presenteado" },
        { status: 400 }
      );
    }

    const amount = item.price;
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }
    const contributionId = uuidv4();

    const prefResult = await preference.create({
      body: {
        items: [
          {
            id: item.id,
            title: item.name,
            description: `Presente de ${guestName} para o Chá de Bebê`,
            quantity: 1,
            unit_price: amount,
            currency_id: "BRL",
          },
        ],
        payer: {
          name: guestName.trim(),
        },
        payment_methods: {
          excluded_payment_types: [],
          installments: 12,
        },
        back_urls: {
          success: `${baseUrl}/success?contribution=${contributionId}`,
          failure: `${baseUrl}/?error=payment_failed`,
          pending: `${baseUrl}/success?contribution=${contributionId}&status=pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        external_reference: contributionId,
        metadata: {
          contributionId,
          itemId,
          guestName: guestName.trim(),
          message,
        },
      },
    });

    if (!prefResult.id || !prefResult.init_point) throw new Error("Preferência incompleta");
    await addContribution({
      id: contributionId,
      itemId,
      guestName: guestName.trim(),
      message: message ?? "",
      amount,
      paymentId: prefResult.id ?? contributionId,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      preferenceId: prefResult.id,
      initPoint: prefResult.init_point,
      amount,
      contributionId,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento" },
      { status: 500 }
    );
  }
}
