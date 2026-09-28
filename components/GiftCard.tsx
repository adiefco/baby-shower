"use client";

import Image from "next/image";
import { GiftItem } from "@/lib/types";

interface GiftCardProps {
  item: GiftItem;
  onContribute: (item: GiftItem) => void;
  onToast?: (msg: string) => void;
}

export default function GiftCard({ item, onContribute }: GiftCardProps) {
  const isSoldOut = item.limit !== -1 && item.bought >= item.limit;

  return (
    <article
      className="gift-card rounded-2xl flex flex-col justify-between border overflow-hidden"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Product image */}
      <div className="relative">
        <div className="overflow-hidden bg-gray-50 relative" style={{ height: "140px" }}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className="object-contain p-2"
          />
        </div>

        {/* Category badge */}
        <span
          className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: "rgba(250,247,242,0.92)", color: "var(--color-terracotta-dark)", border: "1px solid rgba(176,123,101,0.3)" }}
        >
          {item.category}
        </span>

        {isSoldOut && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(250,247,242,0.75)", backdropFilter: "blur(2px)" }}
          >
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: "var(--color-sage)", color: "white" }}
            >
              Presenteado ✓
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-grow">
        <h3
          className="font-semibold text-xs leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {item.name}
        </h3>

        {item.description && (
          <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-2 border-t flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <span
            className="font-bold text-sm"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-sage-dark)" }}
          >
            R$ {item.price.toFixed(0)}
          </span>

          {isSoldOut ? (
            <span className="text-[10px] font-semibold" style={{ color: "var(--color-sage)" }}>
              ✓ Presenteado
            </span>
          ) : (
            <button
              onClick={() => onContribute(item)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors text-white"
              style={{ background: "var(--color-terracotta)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-terracotta-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-terracotta)")}
            >
              Presentear
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
