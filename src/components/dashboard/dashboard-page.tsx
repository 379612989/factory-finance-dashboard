"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  ClipboardList,
  Download,
  PackageCheck,
  Percent,
  Receipt,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { QrPreview } from "@/components/qr-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  defaultFilters,
  getAvailableYears,
  getChannelBreakdown,
  getCompareRate,
  getCustomerDebtRank,
  getExpenseBreakdown,
  getMonthlyDetails,
  getMonthlyTrend,
  getPeriodSummary,
  getPreviousMonthFilters,
  getProductProfitRank,
} from "@/lib/calculations";
import { downloadCsv } from "@/lib/csv";
import { BusinessData, DashboardFilters } from "@/lib/types";
import {
  cn,
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

const pieColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#64748b", "#f97316"];

const months = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

type DashboardPageProps = {
  initialData: BusinessData;
};

export function DashboardPage({ initialData }: DashboardPageProps) {
  const [filters, setFilters] = useState<DashboardFilters>(() => defaultFilters(initialData));

  const years = useMemo(() => getAvailableYears(initialData), [initialData]);
  const summary = useMemo(() => getPeriodSummary(initialData, filters), [initialData, filters]);
  const previousSummary = useMemo(
    () => getPeriodSummary(initialData, getPreviousMonthFilters(filters)),
    [initialData, filters],
  );
  const monthlyTrend = useMemo(
    () => getMonthlyTrend(initialData, filters),
    [initialData, filters],
  );
  const monthlyDetails = useMemo(
    () => getMonthlyDetails(initialData, filters),
    [initialData, filters],
  );
  const expenseBreakdown = useMemo(
    () => getExpenseBreakdown(initialData, filters),
    [initialData, filters],
  );
  const channelBreakdown = useMemo(
    () => getChannelBreakdown(initialData, filters),
    [initialData, filters],
  );
  const productRank = useMemo(
    () => getProductProfitRank(initialData, filters).slice(0, 8),
    [initialData, filters],
  );
  const customerDebtRank = useMemo(
    () => getCustomerDebtRank(initialData, filters).slice(0, 6),
    [initialData, filters],
  );

  const setFilter = (key: keyof DashboardFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters(initialData));
  };

  const exportMonthlyDetails = () => {
    downloadCsv(`月度经营明细-${filters.year}.csv`, monthlyDetails, [
      { label: "月份", value: "month" },
      { label: "销售额", value: "salesAmount" },
      { label: "销量", value: "quantity" },
      { label: "商品成本", value: "productCost" },
      { label: "期间支出", value: "expenses" },
      { label: "净利润", value: "netProfit" },
      { label: "利润率", value: (row) => formatPercent(row.profitRate) },
      { label: "回款金额", value: "receivedAmount" },
      { label: "未收款金额", value: "unpaidAmount" },
      { label: "订单数", value: "orderCount" },
    ]);
  };

  const kpis = [
    {
      title: "本月销售额",
      value: formatCompactCurrency(summary.salesAmount),
      compare: getCompareRate(summary.salesAmount, previousSummary.salesAmount),
      icon: Banknote,
      tone: "blue",
      positiveWhen: "up",
    },
    {
      title: "本月销量",
      value: `${formatNumber(summary.quantity)} 件`,
      compare: getCompareRate(summary.quantity, previousSummary.quantity),
      icon: PackageCheck,
      tone: "violet",
      positiveWhen: "up",
    },
    {
      title: "本月总支出",
      value: formatCompactCurrency(summary.expenses),
      compare: getCompareRate(summary.expenses, previousSummary.expenses),
      icon: Receipt,
      tone: "amber",
      positiveWhen: "down",
    },
    {
      title: "本月净利润",
      value: formatCompactCurrency(summary.netProfit),
      compare: getCompareRate(summary.netProfit, previousSummary.netProfit),
      icon: summary.netProfit >= 0 ? TrendingUp : TrendingDown,
      tone: summary.netProfit >= 0 ? "green" : "red",
      positiveWhen: "up",
    },
    {
      title: "本月利润率",
      value: formatPercent(summary.profitRate),
      compare: getCompareRate(summary.profitRate, previousSummary.profitRate),
      icon: Percent,
      tone: summary.profitRate >= 0.12 ? "green" : "amber",
      positiveWhen: "up",
    },
    {
      title: "本月回款金额",
      value: formatCompactCurrency(summary.receivedAmount),
      compare: getCompareRate(summary.receivedAmount, previousSummary.receivedAmount),
      icon: WalletCards,
      tone: "cyan",
      positiveWhen: "up",
    },
    {
      title: "本月未收款金额",
      value: formatCompactCurrency(summary.unpaidAmount),
      compare: getCompareRate(summary.unpaidAmount, previousSummary.unpaidAmount),
      icon: AlertTriangle,
      tone: summary.unpaidAmount / Math.max(summary.salesAmount, 1) > 0.28 ? "red" : "amber",
      positiveWhen: "down",
    },
    {
      title: "本月订单数",
      value: `${formatNumber(summary.orderCount)} 单`,
      compare: getCompareRate(summary.orderCount, previousSummary.orderCount),
      icon: ClipboardList,
      tone: "slate",
      positiveWhen: "up",
    },
  ] as const;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={initialData.source === "supabase" ? "success" : "warning"}>
                {initialData.source === "supabase" ? "Supabase 实时数据" : "演示数据"}
              </Badge>
              <Badge variant="muted">{filters.year}-{filters.month}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-normal text-slate-950 sm:text-3xl lg:text-4xl">
              小微工厂经营看板
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              实时掌握销售、支出、利润与回款情况
            </p>
          </div>
          <QrPreview />
        </section>

        <Card className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr_1.4fr_1fr_auto_auto]">
            <FilterField label="年份">
              <Select value={filters.year} onChange={(event) => setFilter("year", event.target.value)}>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </Select>
            </FilterField>
            <FilterField label="月份">
              <Select value={filters.month} onChange={(event) => setFilter("month", event.target.value)}>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {Number(month)}月
                  </option>
                ))}
              </Select>
            </FilterField>
            <FilterField label="产品">
              <Select
                value={filters.productId}
                onChange={(event) => setFilter("productId", event.target.value)}
              >
                <option value="all">全部产品</option>
                {initialData.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
              </Select>
            </FilterField>
            <FilterField label="客户">
              <Select
                value={filters.customerId}
                onChange={(event) => setFilter("customerId", event.target.value)}
              >
                <option value="all">全部客户</option>
                {initialData.customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name}
                  </option>
                ))}
              </Select>
            </FilterField>
            <FilterField label="渠道">
              <Select value={filters.channel} onChange={(event) => setFilter("channel", event.target.value)}>
                <option value="all">全部渠道</option>
                {["批发", "餐饮", "零售", "电商", "其他"].map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </Select>
            </FilterField>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                <RefreshCcw className="h-4 w-4" />
                重置
              </Button>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={exportMonthlyDetails}>
                <Download className="h-4 w-4" />
                导出
              </Button>
            </div>
          </div>
        </Card>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:gap-4">
          {kpis.map((item) => (
            <KpiCard key={item.title} {...item} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>每月销售额与利润趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] sm:h-[330px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={monthlyTrend} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="monthName" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${Math.round(Number(value) / 10000)}万`}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      width={42}
                    />
                    <Tooltip content={<MoneyTooltip />} />
                    <Area type="monotone" dataKey="销售额" fill="url(#salesFill)" stroke="transparent" />
                    <Line type="monotone" dataKey="销售额" stroke="#2563eb" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="净利润" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>支出分类占比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[170px_minmax(0,1fr)] xl:grid-cols-1">
                <div className="mx-auto h-[190px] w-full max-w-[240px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={82}
                        paddingAngle={3}
                      >
                        {expenseBreakdown.map((item, index) => (
                          <Cell key={item.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<MoneyTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <LegendList rows={expenseBreakdown} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>产品利润排行</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[330px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={productRank.slice(0, 6)} layout="vertical" margin={{ left: 8, right: 18, top: 8, bottom: 8 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => `${Math.round(Number(value) / 10000)}万`} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={92}
                      tickFormatter={(value) => String(value).replace(/\s.*/, "").slice(0, 7)}
                      tick={{ fontSize: 12, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ProductTooltip />} />
                    <Bar dataKey="profit" radius={[0, 8, 8, 0]} fill="#10b981" barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>客户欠款排行</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerDebtRank.map((customer, index) => (
                  <div key={customer.name} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {index + 1}
                          </span>
                          <p className="truncate text-sm font-bold text-slate-900">{customer.name}</p>
                          {customer.debtRate > 0.35 ? <Badge variant="danger">高风险</Badge> : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          销售 {formatCompactCurrency(customer.sales)} · 欠款占比 {formatPercent(customer.debtRate)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-red-600">{formatCompactCurrency(customer.unpaid)}</p>
                        <p className="text-xs text-slate-400">未收款</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          customer.debtRate > 0.35 ? "bg-red-500" : "bg-amber-400",
                        )}
                        style={{ width: `${Math.min(customer.debtRate * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(340px,0.7fr)_minmax(0,1.3fr)]">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>渠道销售占比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-1">
                <div className="mx-auto h-[210px] w-full max-w-[260px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie data={channelBreakdown} dataKey="value" nameKey="name" outerRadius={88} innerRadius={58} paddingAngle={4}>
                        {channelBreakdown.map((item, index) => (
                          <Cell key={item.name} fill={pieColors[(index + 2) % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<MoneyTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <LegendList rows={channelBreakdown} />
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>月度经营明细表</CardTitle>
              <Button variant="outline" size="sm" onClick={exportMonthlyDetails}>
                <Download className="h-4 w-4" />
                导出 CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-100 scrollbar-soft">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>月份</TableHead>
                      <TableHead>销售额</TableHead>
                      <TableHead>销量</TableHead>
                      <TableHead>商品成本</TableHead>
                      <TableHead>期间支出</TableHead>
                      <TableHead>净利润</TableHead>
                      <TableHead>利润率</TableHead>
                      <TableHead>回款金额</TableHead>
                      <TableHead>未收款金额</TableHead>
                      <TableHead>订单数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyDetails.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-semibold text-slate-900">{row.month}</TableCell>
                        <TableCell>{formatCurrency(row.salesAmount)}</TableCell>
                        <TableCell>{formatNumber(row.quantity)}</TableCell>
                        <TableCell>{formatCurrency(row.productCost)}</TableCell>
                        <TableCell>{formatCurrency(row.expenses)}</TableCell>
                        <TableCell className={row.netProfit >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                          {formatCurrency(row.netProfit)}
                        </TableCell>
                        <TableCell>{formatPercent(row.profitRate)}</TableCell>
                        <TableCell>{formatCurrency(row.receivedAmount)}</TableCell>
                        <TableCell className="text-amber-700">{formatCurrency(row.unpaidAmount)}</TableCell>
                        <TableCell>{row.orderCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function KpiCard({
  title,
  value,
  compare,
  icon: Icon,
  tone,
  positiveWhen,
}: {
  title: string;
  value: string;
  compare: number;
  icon: React.ElementType;
  tone: "blue" | "green" | "red" | "amber" | "violet" | "cyan" | "slate";
  positiveWhen: "up" | "down";
}) {
  const compareUp = compare >= 0;
  const healthy = positiveWhen === "up" ? compareUp : !compareUp;
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    cyan: "bg-cyan-50 text-cyan-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <Card className="min-w-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-500 sm:text-sm">{title}</p>
          <p className="mt-2 truncate text-2xl font-black tracking-normal text-slate-950 sm:text-3xl">
            {value}
          </p>
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div
        className={cn(
          "mt-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
          healthy ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
        )}
      >
        {compareUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        环比 {compareUp ? "+" : ""}
        {formatPercent(compare)}
      </div>
    </Card>
  );
}

function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-xl">
      {label ? <p className="mb-2 text-xs font-bold text-slate-500">{label}</p> : null}
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              {item.name}
            </span>
            <span className="font-bold text-slate-950">{formatCurrency(Number(item.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; sales: number; cost: number; profit: number; profitRate: number } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3 text-sm shadow-xl">
      <p className="font-bold text-slate-950">{item.name}</p>
      <p className="mt-2 text-slate-600">销售额：{formatCurrency(item.sales)}</p>
      <p className="text-slate-600">成本：{formatCurrency(item.cost)}</p>
      <p className="font-bold text-emerald-600">净利润：{formatCurrency(item.profit)}</p>
      <p className="text-slate-600">利润率：{formatPercent(item.profitRate)}</p>
    </div>
  );
}

function LegendList({ rows }: { rows: Array<{ name: string; value: number }> }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="space-y-3">
      {rows.map((row, index) => {
        const percent = total ? row.value / total : 0;

        return (
          <div key={row.name} className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: pieColors[index % pieColors.length] }}
                />
                <span className="truncate text-sm font-semibold text-slate-700">{row.name}</span>
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-500">{formatPercent(percent)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(percent * 100, 100)}%`,
                  background: pieColors[index % pieColors.length],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
