import { supabase } from "./supabase";
import { supabaseServer } from "./supabase-server";
import { GiftItem, Contribution } from "./types";

function toGiftItem(row: Record<string, unknown>): GiftItem {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    image: row.image as string,
    price: Number(row.price),
    sellingPrice: Number(row.selling_price),
    category: row.category as string,
    limit: row.limit as number,
    bought: row.bought as number,
  };
}

function toContribution(row: Record<string, unknown>): Contribution {
  return {
    id: row.id as string,
    itemId: row.item_id as string,
    guestName: row.guest_name as string,
    message: (row.message as string) ?? "",
    amount: Number(row.amount),
    paymentId: row.payment_id as string,
    status: row.status as Contribution["status"],
    createdAt: row.created_at as string,
  };
}

export async function getItems(): Promise<GiftItem[]> {
  const { data, error } = await supabase.from("items").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toGiftItem);
}

export async function getItem(id: string): Promise<GiftItem | undefined> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return toGiftItem(data);
}

export async function getApprovedContributions(): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("status", "approved");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toContribution);
}

export async function addContribution(contribution: Contribution): Promise<void> {
  const { error } = await supabaseServer.from("contributions").insert({
    id: contribution.id,
    item_id: contribution.itemId,
    guest_name: contribution.guestName,
    message: contribution.message,
    amount: contribution.amount,
    payment_id: contribution.paymentId,
    status: contribution.status,
    created_at: contribution.createdAt,
  });
  if (error) throw new Error(error.message);
}

export async function updateContributionStatus(
  contributionId: string,
  status: Contribution["status"]
): Promise<void> {
  const { data: contribution, error: fetchError } = await supabaseServer
    .from("contributions")
    .select("item_id")
    .eq("id", contributionId)
    .single();

  if (fetchError || !contribution) return;

  const { error: updateError } = await supabaseServer
    .from("contributions")
    .update({ status })
    .eq("id", contributionId);

  if (updateError) throw new Error(updateError.message);

  if (status === "approved") {
    await supabaseServer.rpc("increment_bought", { item_id: contribution.item_id });
  }
}
