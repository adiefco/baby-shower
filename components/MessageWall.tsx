"use client";

import { Contribution, Message } from "@/lib/types";

interface MessageWallProps {
  contributions: Contribution[];
  messages: Message[];
}

type WallEntry =
  | { kind: "contribution"; data: Contribution }
  | { kind: "message"; data: Message };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}

export default function MessageWall({ contributions, messages }: MessageWallProps) {
  const contribEntries: WallEntry[] = contributions
    .filter((c) => c.message?.trim())
    .map((c) => ({ kind: "contribution", data: c }));

  const msgEntries: WallEntry[] = messages
    .filter((m) => m.message?.trim())
    .map((m) => ({ kind: "message", data: m }));

  const all = [...contribEntries, ...msgEntries].sort(
    (a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
  );

  if (all.length === 0) return null;

  return (
    <div className="space-y-3">
      {all.map((entry) => {
        const isContrib = entry.kind === "contribution";
        const name = entry.data.guestName;
        const text = entry.data.message;
        const date = formatDate(entry.data.createdAt);

        return (
          <div
            key={entry.data.id}
            className="p-4 rounded-xl border-l-4"
            style={{
              background: "var(--color-surface)",
              borderLeftColor: isContrib ? "var(--color-terracotta)" : "var(--color-sage)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-semibold text-xs" style={{ color: "var(--color-sage-dark)" }}>
                {name}
              </h4>
              <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                {date}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              "{text}"
            </p>
            {isContrib && (
              <div className="mt-2">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "var(--color-terracotta-light)", color: "var(--color-terracotta-dark)" }}
                >
                  🎁 R$ {(entry.data as Contribution).amount?.toFixed(0)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
