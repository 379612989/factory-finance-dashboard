import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { buildDemoData } from "../src/lib/demo-data";

function loadEnvFile(file: string) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] = process.env[key] ?? value;
  });
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Please configure .env.local before seeding.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function clearTable(table: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) throw new Error(`Failed to clear ${table}: ${error.message}`);
}

async function insertTable(table: string, rows: Record<string, unknown>[]) {
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`Failed to insert ${table}: ${error.message}`);
}

async function main() {
  const data = buildDemoData();

  await clearTable("sales_orders");
  await clearTable("expenses");
  await clearTable("products");
  await clearTable("customers");

  await insertTable("products", data.products as unknown as Record<string, unknown>[]);
  await insertTable("customers", data.customers as unknown as Record<string, unknown>[]);
  await insertTable("expenses", data.expenses as unknown as Record<string, unknown>[]);
  await insertTable("sales_orders", data.salesOrders as unknown as Record<string, unknown>[]);

  console.log("Seed completed.");
  console.log(`Products: ${data.products.length}`);
  console.log(`Customers: ${data.customers.length}`);
  console.log(`Sales orders: ${data.salesOrders.length}`);
  console.log(`Expenses: ${data.expenses.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
