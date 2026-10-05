import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const { data, error } = await supabaseServer.from("contributions")
    .select("status").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ status: data.status }, { headers: { "Cache-Control": "no-store" } });
}
