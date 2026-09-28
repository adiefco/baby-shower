"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import GiftCard from "@/components/GiftCard";
import ContributeModal from "@/components/ContributeModal";
import MessageWall from "@/components/MessageWall";
import MessageForm from "@/components/MessageForm";
import { GiftItem, Contribution, Message } from "@/lib/types";

interface ItemWithContributions extends GiftItem {
  contributions: Contribution[];
}

function BabyShowerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ItemWithContributions[]>([]);
  const [selectedItem, setSelectedItem] = useState<GiftItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");
  const [sort, setSort] = useState<"price-desc" | "price-asc">("price-desc");
  const [errorBanner, setErrorBanner] = useState("");
  const [toast, setToast] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchItems();
    fetchMessages();
    if (searchParams.get("error") === "payment_failed") {
      setErrorBanner("O pagamento não foi concluído. Você pode tentar novamente.");
    }
  }, [searchParams]);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      console.error("Failed to fetch messages");
    }
  }

  async function fetchItems() {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      console.error("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  }

  async function handleContributeSubmit(data: {
    guestName: string;
    message: string;
  }) {
    if (!selectedItem) return;

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: selectedItem.id,
        guestName: data.guestName,
        message: data.message,
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? "Erro ao processar");

    sessionStorage.setItem("checkoutData", JSON.stringify({
      preferenceId: result.preferenceId,
      amount: result.amount,
      itemName: selectedItem.name,
      itemImage: selectedItem.image,
      guestName: data.guestName,
      message: data.message,
      contributionId: result.contributionId,
    }));

    router.push("/checkout");
  }

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }, []);

  // 31/08/2025 = 11 semanas e 4 dias → dia de referência = 31/08 - (11*7 + 4) dias = concepção aproximada
  const REFERENCE_DATE = new Date("2026-08-31T12:00:00");
  const REFERENCE_DAYS = 11 * 7 + 4; // 81 dias de gestação nessa data
  const today = new Date();
  const daysSinceRef = Math.floor((today.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = REFERENCE_DAYS + daysSinceRef;
  const gestWeeks = Math.floor(totalDays / 7);

  const allMessages: import("@/lib/types").Contribution[] = [];
  const categories = ["todos", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = (filter === "todos" ? items : items.filter((i) => i.category === filter))
    .slice()
    .sort((a, b) => sort === "price-desc" ? b.price - a.price : a.price - b.price);


  return (
    <div className="botanical-bg min-h-screen flex flex-col relative">
      {/* Error banner */}
      {errorBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 text-sm text-center font-medium"
          style={{ background: "#fef2f2", color: "#b91c1c", borderBottom: "1px solid #fecaca" }}>
          {errorBanner}
          <button onClick={() => setErrorBanner("")} className="ml-3 underline">Fechar</button>
        </div>
      )}

      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(250, 247, 242, 0.92)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(104, 122, 101, 0.15)",
          boxShadow: "0 1px 8px rgba(104,122,101,0.06)",
          marginTop: errorBanner ? "48px" : 0,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-center">
          <nav className="flex gap-3">
            <a
              href="#presentes"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-colors text-white"
              style={{ background: "var(--color-terracotta)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-terracotta-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-terracotta)")}
            >
              <i className="fa-solid fa-gift" />
              Presentes
            </a>
            <a
              href="#recados"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-colors text-white"
              style={{ background: "var(--color-terracotta)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-terracotta-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-terracotta)")}
            >
              <i className="fa-regular fa-comment" />
              Recados
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-2xl mx-auto w-full px-4 py-6 relative z-10">

        {/* Hero section */}
        <section className="text-center py-4">
          {/* Decorative SVG */}
          <div className="flex justify-center mb-3 opacity-70">
            <svg width="180" height="40" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20 C 40 5, 60 35, 90 20 C 120 5, 140 35, 170 20" stroke="#687A65" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="45" cy="14" r="3.5" fill="#B07B65" opacity="0.8" />
              <circle cx="135" cy="26" r="3.5" fill="#B07B65" opacity="0.8" />
              <path d="M35 16 C 30 8, 22 12, 26 20" fill="#687A65" opacity="0.6" />
              <path d="M145 24 C 150 32, 158 28, 154 20" fill="#687A65" opacity="0.6" />
            </svg>
          </div>

          <h1
            className="leading-none"
            style={{ fontFamily: "var(--font-script)", fontSize: "2.8rem", color: "var(--color-sage-dark)" }}
          >
            Chá do Bebê
          </h1>
          <p
            className="font-semibold tracking-widest uppercase mt-1 mb-6"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--color-terracotta)" }}
          >
            DA CAMILA E DO ANDRÉ
          </p>


          {/* Photo + weeks badge */}
          <div className="relative max-w-sm mx-auto mb-12">
            <div
              className="p-3 rounded-3xl border"
              style={{
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-card)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80"
                  alt="Camila"
                  className="w-full object-cover object-center"
                  style={{ height: "360px", filter: "grayscale(100%) contrast(108%) brightness(102%)" }}
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/400x500/FAF7F2/687A65?text=Foto+da+Camila";
                  }}
                />
              </div>
            </div>

            {/* Weeks badge */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 rounded-2xl p-2.5 text-center border"
              style={{
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-card)",
                borderColor: "rgba(213, 161, 142, 0.4)",
              }}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider block"
                style={{ color: "var(--color-text-muted)" }}>
                Mamãe está de
              </span>
              <span
                className="block leading-none my-0.5"
                style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: 700, color: "var(--color-terracotta)" }}
              >
                {gestWeeks}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider block"
                style={{ color: "var(--color-sage)" }}>
                Semanas
              </span>
            </div>
          </div>
        </section>

        {/* Welcome card */}
        <section
          className="rounded-2xl p-6 text-center mb-8 border"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
            boxShadow: "var(--shadow-card)",
            borderColor: "rgba(104, 122, 101, 0.15)",
          }}
        >
          <h2
            className="font-bold mb-3"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--color-sage-dark)" }}
          >
            É hora de celebrar!
          </h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-secondary)" }}>
            Com imensa alegria, preparamos esse cantinho para compartilhar todo esse amor com vocês!
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Para nos presentear, é só escolher um item na lista abaixo. Cada mimosinho será recebido com muito carinho!
          </p>

        </section>

        {/* Gift list */}
        <section id="presentes" className="py-4">
          <div className="text-center mb-6">
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ background: "var(--color-terracotta-light)", color: "var(--color-terracotta-dark)" }}
            >
              Mimos para o Bebê
            </span>
            <h2
              className="font-bold mt-2"
              style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-sage-dark)" }}
            >
              Lista de Presentes
            </h2>
            <p className="text-xs mt-1" style={{ color: "#000" }}>
              Escolha um presente para contribuir com praticidade
            </p>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs rounded-xl px-4 py-2 font-medium outline-none border"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "rgba(104, 122, 101, 0.3)",
                  color: "var(--color-text-primary)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <option value="todos">Todos os Itens</option>
                {categories.filter((c) => c !== "todos").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "price-desc" | "price-asc")}
                className="text-xs rounded-xl px-4 py-2 font-medium outline-none border"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "rgba(104, 122, 101, 0.3)",
                  color: "var(--color-text-primary)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <option value="price-desc">↓ Maior preço primeiro</option>
                <option value="price-asc">↑ Menor preço primeiro</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "var(--color-surface)" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {filtered.map((item) => (
                <GiftCard
                  key={item.id}
                  item={item}
                  onContribute={(item) => setSelectedItem(item)}
                  onToast={showToast}
                />
              ))}
            </div>
          )}
        </section>

        {/* Message wall */}
        {!loading && (
          <section id="recados" className="py-4">
            <div className="text-center mb-6">
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: "var(--color-surface-warm)", color: "var(--color-sage-dark)" }}
              >
                Mural de Carinho
              </span>
              <h2
                className="font-bold mt-2"
                style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-sage-dark)" }}
              >
                Recadinhos
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                Deixe seu carinho para os papais e para o bebê
              </p>
            </div>
            <MessageForm onSent={(msg) => setMessages((prev) => [msg, ...prev])} />
            <MessageWall contributions={allMessages} messages={messages} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer
        className="text-center py-5 text-xs relative z-10"
        style={{ background: "var(--color-sage-dark)", color: "rgba(255,255,255,0.75)" }}
      >
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>Chá de Bebê da Camila e do André</p>
        <p className="mt-1 text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          Feito com carinho pela{" "}
          <a
            href="https://flow-labs.digital/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.65)", textDecoration: "underline" }}
          >
            Flow Labs
          </a>
        </p>
      </footer>

      {/* Modal */}
      {selectedItem && (
        <ContributeModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSubmit={handleContributeSubmit}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-4 right-4 z-50 text-white text-xs px-4 py-3 rounded-xl shadow-lg toast-visible"
          style={{ background: "#2a2826" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <BabyShowerPage />
    </Suspense>
  );
}
