export type Product = {
  id: string;
  product_code: string;
  product_name: string;
  category: string;
  unit: string;
  standard_price: number;
  unit_cost: number;
  status: "启用" | "停用" | string;
  remark?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Customer = {
  id: string;
  customer_code: string;
  customer_name: string;
  customer_type: string;
  region: string;
  contact_name: string;
  phone: string;
  status: "合作中" | "暂停" | string;
  remark?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SalesOrder = {
  id: string;
  order_code: string;
  order_date: string;
  customer_id: string;
  product_id: string;
  channel: string;
  quantity: number;
  unit: string;
  unit_price: number;
  unit_cost: number;
  sales_amount: number;
  product_cost: number;
  gross_profit: number;
  received_amount: number;
  unpaid_amount: number;
  remark?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Expense = {
  id: string;
  expense_code: string;
  expense_date: string;
  expense_type: string;
  amount: number;
  remark?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BusinessData = {
  products: Product[];
  customers: Customer[];
  salesOrders: SalesOrder[];
  expenses: Expense[];
  source: "supabase" | "demo";
};

export type DashboardFilters = {
  year: string;
  month: string;
  productId: string;
  customerId: string;
  channel: string;
};

export type PeriodSummary = {
  salesAmount: number;
  quantity: number;
  productCost: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  profitRate: number;
  receivedAmount: number;
  unpaidAmount: number;
  orderCount: number;
};

export const CHANNELS = ["批发", "餐饮", "零售", "电商", "其他"] as const;

export const EXPENSE_TYPES = [
  "原材料",
  "人工",
  "物流",
  "房租水电",
  "推广费用",
  "维修",
  "办公",
  "其他",
] as const;
