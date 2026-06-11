import {
  BusinessData,
  Customer,
  DashboardFilters,
  Expense,
  PeriodSummary,
  Product,
  SalesOrder,
} from "./types";
import { toMonth, toYear } from "./utils";

const emptySummary: PeriodSummary = {
  salesAmount: 0,
  quantity: 0,
  productCost: 0,
  expenses: 0,
  grossProfit: 0,
  netProfit: 0,
  profitRate: 0,
  receivedAmount: 0,
  unpaidAmount: 0,
  orderCount: 0,
};

export function getAvailableYears(data: BusinessData) {
  return Array.from(
    new Set([
      ...data.salesOrders.map((item) => toYear(item.order_date)),
      ...data.expenses.map((item) => toYear(item.expense_date)),
    ]),
  ).sort();
}

export function getLatestPeriod(data: BusinessData) {
  const latest = data.salesOrders
    .map((item) => toMonth(item.order_date))
    .sort()
    .at(-1);

  return {
    year: latest?.slice(0, 4) ?? String(new Date().getFullYear()),
    month: latest?.slice(5, 7) ?? String(new Date().getMonth() + 1).padStart(2, "0"),
  };
}

export function defaultFilters(data: BusinessData): DashboardFilters {
  const latest = getLatestPeriod(data);

  return {
    year: latest.year,
    month: latest.month,
    productId: "all",
    customerId: "all",
    channel: "all",
  };
}

function filterOrders(orders: SalesOrder[], filters: DashboardFilters, monthOverride?: string) {
  return orders.filter((order) => {
    const orderYear = toYear(order.order_date);
    const orderMonth = order.order_date.slice(5, 7);

    return (
      orderYear === filters.year &&
      orderMonth === (monthOverride ?? filters.month) &&
      (filters.productId === "all" || order.product_id === filters.productId) &&
      (filters.customerId === "all" || order.customer_id === filters.customerId) &&
      (filters.channel === "all" || order.channel === filters.channel)
    );
  });
}

function filterExpenses(expenses: Expense[], filters: DashboardFilters, monthOverride?: string) {
  return expenses.filter((expense) => {
    const expenseYear = toYear(expense.expense_date);
    const expenseMonth = expense.expense_date.slice(5, 7);

    return expenseYear === filters.year && expenseMonth === (monthOverride ?? filters.month);
  });
}

export function summarize(orders: SalesOrder[], expenses: Expense[]): PeriodSummary {
  const salesAmount = orders.reduce((sum, item) => sum + item.sales_amount, 0);
  const quantity = orders.reduce((sum, item) => sum + item.quantity, 0);
  const productCost = orders.reduce((sum, item) => sum + item.product_cost, 0);
  const expenseAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
  const receivedAmount = orders.reduce((sum, item) => sum + item.received_amount, 0);
  const unpaidAmount = orders.reduce((sum, item) => sum + item.unpaid_amount, 0);
  const grossProfit = salesAmount - productCost;
  const netProfit = grossProfit - expenseAmount;

  return {
    salesAmount,
    quantity,
    productCost,
    expenses: expenseAmount,
    grossProfit,
    netProfit,
    profitRate: salesAmount > 0 ? netProfit / salesAmount : 0,
    receivedAmount,
    unpaidAmount,
    orderCount: orders.length,
  };
}

export function getPeriodSummary(data: BusinessData, filters: DashboardFilters) {
  return summarize(filterOrders(data.salesOrders, filters), filterExpenses(data.expenses, filters));
}

export function getPreviousMonthFilters(filters: DashboardFilters): DashboardFilters {
  const current = new Date(`${filters.year}-${filters.month}-01T00:00:00`);
  current.setMonth(current.getMonth() - 1);

  return {
    ...filters,
    year: String(current.getFullYear()),
    month: String(current.getMonth() + 1).padStart(2, "0"),
  };
}

export function getCompareRate(current: number, previous: number) {
  if (!previous && !current) return 0;
  if (!previous) return 1;
  return (current - previous) / Math.abs(previous);
}

export function getMonthlyTrend(data: BusinessData, filters: DashboardFilters) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const summary = summarize(
      filterOrders(data.salesOrders, filters, month),
      filterExpenses(data.expenses, filters, month),
    );

    return {
      month,
      monthName: `${index + 1}月`,
      销售额: Math.round(summary.salesAmount),
      净利润: Math.round(summary.netProfit),
      回款: Math.round(summary.receivedAmount),
      未收款: Math.round(summary.unpaidAmount),
    };
  });
}

export function getExpenseBreakdown(data: BusinessData, filters: DashboardFilters) {
  const expenses = filterExpenses(data.expenses, filters);
  const grouped = new Map<string, number>();

  expenses.forEach((expense) => {
    grouped.set(expense.expense_type, (grouped.get(expense.expense_type) ?? 0) + expense.amount);
  });

  return Array.from(grouped, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value,
  );
}

export function getChannelBreakdown(data: BusinessData, filters: DashboardFilters) {
  const orders = filterOrders(data.salesOrders, filters);
  const grouped = new Map<string, number>();

  orders.forEach((order) => {
    grouped.set(order.channel, (grouped.get(order.channel) ?? 0) + order.sales_amount);
  });

  return Array.from(grouped, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value,
  );
}

export function getProductProfitRank(data: BusinessData, filters: DashboardFilters) {
  const productMap = new Map(data.products.map((product) => [product.id, product]));
  const grouped = new Map<string, { product: Product; sales: number; cost: number; profit: number; qty: number }>();

  filterOrders(data.salesOrders, filters).forEach((order) => {
    const product = productMap.get(order.product_id);
    if (!product) return;
    const current = grouped.get(product.id) ?? {
      product,
      sales: 0,
      cost: 0,
      profit: 0,
      qty: 0,
    };

    current.sales += order.sales_amount;
    current.cost += order.product_cost;
    current.profit += order.gross_profit;
    current.qty += order.quantity;
    grouped.set(product.id, current);
  });

  return Array.from(grouped.values())
    .map((item) => ({
      name: item.product.product_name,
      category: item.product.category,
      sales: Math.round(item.sales),
      cost: Math.round(item.cost),
      profit: Math.round(item.profit),
      quantity: item.qty,
      profitRate: item.sales > 0 ? item.profit / item.sales : 0,
    }))
    .sort((a, b) => b.profit - a.profit);
}

export function getCustomerDebtRank(data: BusinessData, filters: DashboardFilters) {
  const customerMap = new Map(data.customers.map((customer) => [customer.id, customer]));
  const grouped = new Map<
    string,
    { customer: Customer; sales: number; received: number; unpaid: number; orders: number }
  >();

  filterOrders(data.salesOrders, filters).forEach((order) => {
    const customer = customerMap.get(order.customer_id);
    if (!customer) return;
    const current = grouped.get(customer.id) ?? {
      customer,
      sales: 0,
      received: 0,
      unpaid: 0,
      orders: 0,
    };

    current.sales += order.sales_amount;
    current.received += order.received_amount;
    current.unpaid += order.unpaid_amount;
    current.orders += 1;
    grouped.set(customer.id, current);
  });

  return Array.from(grouped.values())
    .map((item) => ({
      name: item.customer.customer_name,
      type: item.customer.customer_type,
      sales: Math.round(item.sales),
      received: Math.round(item.received),
      unpaid: Math.round(item.unpaid),
      debtRate: item.sales > 0 ? item.unpaid / item.sales : 0,
      orders: item.orders,
    }))
    .sort((a, b) => b.unpaid - a.unpaid);
}

export function getMonthlyDetails(data: BusinessData, filters: DashboardFilters) {
  return getMonthlyTrend(data, filters).map((trend) => {
    const summary = summarize(
      filterOrders(data.salesOrders, filters, trend.month),
      filterExpenses(data.expenses, filters, trend.month),
    );

    return {
      month: `${filters.year}-${trend.month}`,
      salesAmount: Math.round(summary.salesAmount),
      quantity: Math.round(summary.quantity),
      productCost: Math.round(summary.productCost),
      expenses: Math.round(summary.expenses),
      netProfit: Math.round(summary.netProfit),
      profitRate: summary.profitRate,
      receivedAmount: Math.round(summary.receivedAmount),
      unpaidAmount: Math.round(summary.unpaidAmount),
      orderCount: summary.orderCount,
    };
  });
}

export function normalizeSummary(summary?: Partial<PeriodSummary>): PeriodSummary {
  return { ...emptySummary, ...summary };
}
