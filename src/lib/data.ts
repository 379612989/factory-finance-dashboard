import { unstable_noStore as noStore } from "next/cache";
import { demoData } from "./demo-data";
import { BusinessData, Customer, Expense, Product, SalesOrder } from "./types";
import { createSupabaseServerClient } from "./supabase/client";

const orderByCreated = { ascending: true };

export async function getBusinessData(): Promise<BusinessData> {
  noStore();
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return demoData;
  }

  const [productsResult, customersResult, salesOrdersResult, expensesResult] =
    await Promise.all([
      supabase.from("products").select("*").order("product_code", orderByCreated),
      supabase.from("customers").select("*").order("customer_code", orderByCreated),
      supabase.from("sales_orders").select("*").order("order_date", orderByCreated),
      supabase.from("expenses").select("*").order("expense_date", orderByCreated),
    ]);

  const hasError =
    productsResult.error ||
    customersResult.error ||
    salesOrdersResult.error ||
    expensesResult.error;

  if (hasError) {
    console.warn("Supabase query failed, falling back to demo data.", hasError);
    return demoData;
  }

  const products = (productsResult.data ?? []) as Product[];
  const customers = (customersResult.data ?? []) as Customer[];
  const salesOrders = (salesOrdersResult.data ?? []) as SalesOrder[];
  const expenses = (expensesResult.data ?? []) as Expense[];

  if (!products.length || !customers.length || !salesOrders.length || !expenses.length) {
    return demoData;
  }

  return {
    products,
    customers,
    salesOrders,
    expenses,
    source: "supabase",
  };
}
