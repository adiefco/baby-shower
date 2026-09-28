import { NextRequest, NextResponse } from "next/server";
import MercadoPago, { Payment } from "mercadopago";
import { updateContributionStatus } from "@/lib/db";

const client = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN ?? "TEST-ACCESS-TOKEN",
});

const payment = new Payment(client);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const topic = body.topic ?? body.type;
    const resourceId = body.data?.id ?? body.id;

    if (topic !== "payment" || !resourceId) {
      return NextResponse.json({ received: true });
    }

    const paymentData = await payment.get({ id: resourceId });

    // external_reference is the contribution UUID we set at preference creation
    const contributionId = paymentData.external_reference;
    const status = paymentData.status;

    if (!contributionId) {
      return NextResponse.json({ received: true });
    }

    if (status === "approved") {
      await updateContributionStatus(contributionId, "approved");
    } else if (status === "rejected" || status === "cancelled") {
      await updateContributionStatus(contributionId, "rejected");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "webhook active" });
}
