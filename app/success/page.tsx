"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const isPending = searchParams.get("status") === "pending";
  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Decorative circles */}
      <div
        className="fixed -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "var(--color-blush-light)", opacity: 0.4 }}
        aria-hidden="true"
      />
      <div
        className="fixed -bottom-16 -left-16 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: "var(--color-sage-light)", opacity: 0.3 }}
        aria-hidden="true"
      />

      <div className="relative max-w-md w-full text-center">
        {/* Icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-8"
          style={{
            background: isPending ? "var(--color-surface-warm)" : "var(--color-sage-light)",
            border: `2px solid ${isPending ? "var(--color-accent-light)" : "var(--color-sage)"}`,
          }}
        >
          {isPending ? "⏳" : "🎀"}
        </div>

        <h1
          className="text-3xl font-bold mb-3"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "var(--color-text-primary)",
            textWrap: "balance",
          }}
        >
          {isPending
            ? "Pagamento em processamento"
            : isDemo
            ? "Contribuição enviada!"
            : "Obrigada pelo seu presente!"}
        </h1>

        <p
          className="text-base leading-relaxed mb-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {isPending
            ? "Seu pagamento está sendo processado. Assim que confirmado, seu nome aparecerá no mural de recados."
            : isDemo
            ? "No ambiente de produção, seu pagamento seria processado com segurança pelo Mercado Pago. Sua mensagem aparecerá no mural após a confirmação."
            : "Sua contribuição foi confirmada e faz parte de algo muito especial. Os papais e o bebê agradecem de coração."}
        </p>

        {(isPending || isDemo) && (
          <p className="text-xs mb-8" style={{ color: "var(--color-text-muted)" }}>
            {isDemo
              ? "Configure NEXT_PUBLIC_MP_PUBLIC_KEY e MP_ACCESS_TOKEN para pagamentos reais."
              : "Você receberá uma confirmação assim que o pagamento for aprovado."}
          </p>
        )}

        {/* Divider */}
        <div
          className="w-16 h-px mx-auto my-8"
          style={{ background: "var(--color-border)" }}
        />

        <div
          className="rounded-2xl p-6 mb-8"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p
            className="text-sm italic leading-relaxed"
            style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-playfair)" }}
          >
            "Cada presente não é apenas um objeto — é um ato de amor que acompanhará o bebê em cada descoberta."
          </p>
          <p
            className="text-xs mt-3 font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            — A família
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "var(--color-accent)",
              color: "#ffffff",
            }}
          >
            Ver mais presentes
          </button>
          <button
            onClick={() => router.push("/#mural")}
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "var(--color-surface)",
              color: "var(--color-text-secondary)",
              border: "1.5px solid var(--color-border)",
            }}
          >
            Ver mural de recados
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
