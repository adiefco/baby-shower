"use client";

import { useState } from "react";
import { Message } from "@/lib/types";

interface MessageFormProps {
  onSent: (msg: Message) => void;
}

export default function MessageForm({ onSent }: MessageFormProps) {
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName, email, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar");
      onSent(data.message);
      setGuestName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Não foi possível enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "var(--color-surface-warm)",
    borderColor: "var(--color-border)",
    color: "var(--color-text-primary)",
  };

  return (
    <div
      className="rounded-2xl p-5 mb-6 border"
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(8px)",
        boxShadow: "var(--shadow-card)",
        borderColor: "rgba(104, 122, 101, 0.15)",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Seu Nome
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            placeholder="Digite seu nome"
            className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-terracotta)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
          />
        </div>

        <div>
          <label
            className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Seu E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-terracotta)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
          />
        </div>

        <div>
          <label
            className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Recado
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            placeholder="Escreva uma mensagem cheia de carinho..."
            className="w-full text-xs px-3 py-2.5 rounded-xl border outline-none transition-all resize-none"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-terracotta)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
          />
        </div>

        {error && (
          <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "#fee2e2", color: "#b91c1c" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-xs font-medium transition-colors text-white disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "var(--color-sage)", cursor: "pointer" }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--color-sage-dark)"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--color-sage)"; }}
        >
          {loading ? "Enviando..." : "Enviar Recadinho"}
        </button>
      </form>
    </div>
  );
}
