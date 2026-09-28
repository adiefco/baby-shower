"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GiftItem } from "@/lib/types";

interface ContributeModalProps {
  item: GiftItem | null;
  onClose: () => void;
  onSubmit: (data: { guestName: string; message: string }) => Promise<void>;
}

export default function ContributeModal({ item, onClose, onSubmit }: ContributeModalProps) {
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setGuestName("");
      setMessage("");
      setError("");
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [item]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!item) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) { setError("Por favor, informe seu nome."); return; }
    setLoading(true);
    setError("");
    try {
      await onSubmit({ guestName: guestName.trim(), message: message.trim() });
    } catch {
      setError("Ocorreu um erro. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(42, 40, 38, 0.5)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-5"
        style={{
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        {/* Drag indicator (mobile) */}
        <div className="sm:hidden mx-auto w-10 h-1 rounded-full mb-1" style={{ background: "var(--color-border)" }} />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden relative"
              style={{ background: "var(--color-surface-warm)" }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="56px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}>
                Presenteando
              </p>
              <h2
                id="modal-title"
                className="font-bold leading-tight"
                style={{ fontFamily: "var(--font-serif)", fontSize: "1.05rem", color: "var(--color-sage-dark)" }}
              >
                {item.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            style={{ background: "var(--color-surface-warm)", color: "var(--color-text-secondary)" }}
            aria-label="Fechar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Price summary */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3 border"
          style={{ background: "var(--color-surface-warm)", borderColor: "var(--color-border)" }}
        >
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Valor do presente
          </span>
          <span
            className="text-xl font-bold tabular-nums"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-sage)" }}
          >
            R$ {item.price.toFixed(0)}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label
              htmlFor="guest-name"
              className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Seu nome *
            </label>
            <input
              ref={firstInputRef}
              id="guest-name"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Como gostaria de ser chamado(a)?"
              required
              className="w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all border"
              style={{
                background: "var(--color-surface-warm)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-terracotta)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="guest-message"
              className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Recado (opcional)
            </label>
            <textarea
              id="guest-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Deixe um recado para os papais e o bebê..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all resize-none border"
              style={{
                background: "var(--color-surface-warm)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-terracotta)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ background: "#fee2e2", color: "#b91c1c" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white"
            style={{ background: loading ? "var(--color-terracotta-mid)" : "var(--color-terracotta)" }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--color-terracotta-dark)"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--color-terracotta)"; }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Preparando pagamento...
              </span>
            ) : (
              `Ir para o Pagamento — R$ ${item.price.toFixed(0)}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
