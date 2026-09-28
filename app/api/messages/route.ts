import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase GET error:", error);
    return NextResponse.json({ error: "Erro ao buscar recados." }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guestName, email, message } = body;

  if (!guestName?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Nome, e-mail e recado são obrigatórios." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      guest_name: guestName.trim(),
      email: email.trim(),
      message: message.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase POST error:", error);
    return NextResponse.json({ error: "Erro ao salvar recado." }, { status: 500 });
  }

  return NextResponse.json({
    message: {
      id: data.id,
      guestName: data.guest_name,
      email: data.email,
      message: data.message,
      createdAt: data.created_at,
    },
  }, { status: 201 });
}
