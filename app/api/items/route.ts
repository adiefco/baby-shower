import { NextResponse } from "next/server";
import { getItems, getApprovedContributions } from "@/lib/db";

export async function GET() {
  try {
    const [items, contributions] = await Promise.all([
      getItems(),
      getApprovedContributions(),
    ]);

    const itemsWithContributions = items.map((item) => ({
      ...item,
      contributions: contributions.filter((c) => c.itemId === item.id),
    }));

    return NextResponse.json({ items: itemsWithContributions });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar itens" }, { status: 500 });
  }
}
