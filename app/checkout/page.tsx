"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale: string }) => {
      bricks: () => {
        create: (
          brick: string,
          containerId: string,
          settings: Record<string, unknown>
        ) => Promise<{ unmount: () => void }>;
      };
    };
  }
}

interface CheckoutData {
  preferenceId: string;
  amount: number;
  itemName: string;
  itemEmoji: string;
  guestName: string;
  message: string;
  contributionId: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [mpLoaded, setMpLoaded] = useState(false);
  const [brickError, setBrickError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("checkoutData");
    if (!raw) {
      router.replace("/");
      return;
    }
    setCheckoutData(JSON.parse(raw));
  }, [router]);

  useEffect(() => {
    if (!checkoutData) return;

    // Load MP SDK script
    if (document.getElementById("mp-sdk")) {
      setMpLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "mp-sdk";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = () => setMpLoaded(true);
    script.onerror = () => setBrickError("Falha ao carregar o SDK do Mercado Pago.");
    document.head.appendChild(script);
  }, [checkoutData]);

  useEffect(() => {
    if (!mpLoaded || !checkoutData) return;

    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "TEST-PUBLIC-KEY";

    if (!window.MercadoPago) {
      setBrickError("SDK do Mercado Pago não disponível.");
      return;
    }

    const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
    const bricksBuilder = mp.bricks();

    // Payment Brick covers Pix, credit card, and boleto
    bricksBuilder
      .create("payment", "payment-brick-container", {
        initialization: {
          amount: checkoutData.amount,
          preferenceId: checkoutData.preferenceId,
          payer: {
            firstName: checkoutData.guestName,
          },
        },
        customization: {
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "all", // boleto
            bankTransfer: "all", // pix
            atm: "all",
            maxInstallments: 3,
          },
          visual: {
            style: {
              theme: "default",
              customVariables: {
                formBackgroundColor: "transparent",
                baseColor: "#d4845a",
              },
            },
          },
        },
        callbacks: {
          onReady: () => {
            console.log("Brick ready");
          },
          onSubmit: async ({ selectedPaymentMethod, formData }: { selectedPaymentMethod: string; formData: Record<string, unknown> }) => {
            // In a real app you'd send formData to your API for processing
            // For this demo, redirect to success
            console.log("Payment submitted:", selectedPaymentMethod, formData);
            sessionStorage.removeItem("checkoutData");
            router.push(`/success?contribution=${checkoutData.contributionId}&demo=true`);
          },
          onError: (error: unknown) => {
            console.error("Brick error:", error);
            setBrickError("Erro no formulário de pagamento. Tente novamente.");
          },
        },
      })
      .catch(() => {
        setBrickError("Erro ao inicializar o formulário de pagamento.");
      });

    return () => {
      // Cleanup handled by brick unmount
    };
  }, [mpLoaded, checkoutData, router]);

  if (!checkoutData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-bg)" }}
      >
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--color-border)",
            borderTopColor: "var(--color-accent)",
          }}
        />
      </div>
    );
  }

  return (
    <main
      className="min-h-screen py-10 px-4"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-lg mx-auto">
        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar à lista
        </button>

        {/* Order summary */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p
            className="text-xs font-medium uppercase tracking-wider mb-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            Resumo da contribuição
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: "var(--color-surface-warm)" }}
            >
              {checkoutData.itemEmoji}
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-playfair)" }}
              >
                {checkoutData.itemName}
              </p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Contribuindo como{" "}
                <span style={{ color: "var(--color-accent-deep)" }}>
                  {checkoutData.guestName}
                </span>
              </p>
            </div>
          </div>

          {checkoutData.message && (
            <div
              className="rounded-xl px-4 py-3 mb-4 text-sm italic"
              style={{
                background: "var(--color-surface-warm)",
                color: "var(--color-text-secondary)",
                borderLeft: "3px solid var(--color-blush)",
              }}
            >
              "{checkoutData.message}"
            </div>
          )}

          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Total a pagar
            </span>
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: "var(--color-accent-deep)", fontFamily: "var(--font-playfair)" }}
            >
              R$ {checkoutData.amount.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Payment methods info */}
        <div className="flex items-center gap-3 mb-6 justify-center flex-wrap">
          {["Pix", "Cartão", "Boleto"].map((method) => (
            <span
              key={method}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
              }}
            >
              {method}
            </span>
          ))}
        </div>

        {/* Brick container */}
        {brickError ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "#b91c1c" }}>
              {brickError}
            </p>
            <p className="text-xs mt-2" style={{ color: "#ef4444" }}>
              Verifique se a chave pública do Mercado Pago está configurada em{" "}
              <code>.env.local</code> e recarregue a página.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 text-sm underline"
              style={{ color: "#b91c1c" }}
            >
              Voltar ao início
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            {!mpLoaded && (
              <div className="flex items-center justify-center py-16 gap-3" style={{ color: "var(--color-text-muted)" }}>
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: "var(--color-border)",
                    borderTopColor: "var(--color-accent)",
                  }}
                />
                <span className="text-sm">Carregando formas de pagamento...</span>
              </div>
            )}
            <div id="payment-brick-container" className="p-4" />
          </div>
        )}

        <p
          className="text-xs text-center mt-6"
          style={{ color: "var(--color-text-muted)" }}
        >
          Pagamento processado com segurança pelo Mercado Pago
        </p>
      </div>
    </main>
  );
}
