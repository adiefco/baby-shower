import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const dbPath = path.join(process.cwd(), "data", "db.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

const items = db.items.map((item: {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  sellingPrice: number;
  category: string;
  limit: number;
  bought: number;
}) => ({
  id: item.id,
  name: item.name,
  description: item.description ?? null,
  image: item.image,
  price: item.price,
  selling_price: item.sellingPrice,
  category: item.category,
  limit: item.limit,
  bought: item.bought,
}));

async function seed() {
  console.log(`Inserindo ${items.length} itens no Supabase...`);

  const { error } = await supabase
    .from("items")
    .upsert(items, { onConflict: "id" });

  if (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  }

  console.log(`✓ ${items.length} itens inseridos com sucesso!`);
}

seed();
