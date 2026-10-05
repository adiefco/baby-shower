"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contributionId = searchParams.get("contribution");
  const [status, setStatus] = useState("pending");
  const isPending = status !== "approved";

  useEffect(() => {
    if (!contributionId) return;
    let active = true;
    const check = async () => {
      try {
        const response = await fetch(`/api/contributions/status?id=${encodeURIComponent(contributionId)}`, { cache: "no-store" });
        if (response.ok && active) setStatus((await response.json()).status);
      } catch { /* Keep the safe pending state while offline. */ }
    };
    void check();
    const interval = setInterval(check, 5000);
    return () => { active = false; clearInterval(interval); };
  }, [contributionId]);

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
          {status === "rejected" ? "Pagamento não concluído" : isPending ? "Aguardando confirmação" : "Obrigada pelo seu presente!"}
        </h1>

        <p
          className="text-base leading-relaxed mb-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {status === "rejected" ? "O pagamento foi recusado ou cancelado. Você pode escolher o presente novamente." : isPending
            ? "Estamos aguardando a confirmação do Mercado Pago. Sua mensagem aparecerá no mural após a aprovação."
            : "Sua contribuição foi confirmada e faz parte de algo muito especial. Os papais e o bebê agradecem de coração."}
        </p>

        {status === "pending" && (
          <p className="text-xs mb-8" style={{ color: "var(--color-text-muted)" }}>
            Esta página atualiza automaticamente quando o pagamento é confirmado.
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
            &ldquo;Cada presente não é apenas um objeto — é um ato de amor que acompanhará o bebê em cada descoberta.&rdquo;
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
            onClick={() => router.push("/#recados")}
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
