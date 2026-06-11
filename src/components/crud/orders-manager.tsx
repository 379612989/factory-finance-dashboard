"use client";

import { useMemo, useState } from "react";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrudModal, Field, FormGrid, PagePanel } from "@/components/crud/common";
import { downloadCsv } from "@/lib/csv";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BusinessData, CHANNELS, SalesOrder } from "@/lib/types";
import { createId, formatCurrency, formatNumber, toMonth } from "@/lib/utils";

type OrdersManagerProps = {
  data: BusinessData;
};

export function OrdersManager({ data }: OrdersManagerProps) {
  const [orders, setOrders] = useState(data.salesOrders);
  const [editing, setEditing] = useState<SalesOrder | null>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("all");
  const [customerId, setCustomerId] = useState("all");
  const [productId, setProductId] = useState("all");
  const [channel, setChannel] = useState("all");

  const productMap = useMemo(
    () => new Map(data.products.map((product) => [product.id, product])),
    [data.products],
  );
  const customerMap = useMemo(
    () => new Map(data.customers.map((customer) => [customer.id, customer])),
    [data.customers],
  );
  const monthOptions = useMemo(
    () => Array.from(new Set(orders.map((order) => toMonth(order.order_date)))).sort(),
    [orders],
  );

  const visibleOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (month === "all" || toMonth(order.order_date) === month) &&
          (customerId === "all" || order.customer_id === customerId) &&
          (productId === "all" || order.product_id === productId) &&
          (channel === "all" || order.channel === channel),
      ),
    [orders, month, customerId, productId, channel],
  );

  const newOrder = (): SalesOrder => {
    const product = data.products[0];
    const customer = data.customers[0];
    const date = new Date().toISOString().slice(0, 10);

    return {
      id: "",
      order_code: `SO-${Date.now()}`,
      order_date: date,
      customer_id: customer?.id ?? "",
      product_id: product?.id ?? "",
      channel: "批发",
      quantity: 1,
      unit: product?.unit ?? "件",
      unit_price: product?.standard_price ?? 0,
      unit_cost: product?.unit_cost ?? 0,
      sales_amount: product?.standard_price ?? 0,
      product_cost: product?.unit_cost ?? 0,
      gross_profit: (product?.standard_price ?? 0) - (product?.unit_cost ?? 0),
      received_amount: 0,
      unpaid_amount: product?.standard_price ?? 0,
      remark: "",
    };
  };

  const startCreate = () => {
    setEditing(newOrder());
    setOpen(true);
  };

  const startEdit = (order: SalesOrder) => {
    setEditing(order);
    setOpen(true);
  };

  const updateEditing = (patch: Partial<SalesOrder>) => {
    setEditing((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      const product = productMap.get(next.product_id);
      const unit = product?.unit ?? next.unit;
      const unitCost = Number(next.unit_cost || product?.unit_cost || 0);
      const unitPrice = Number(next.unit_price || product?.standard_price || 0);
      const quantity = Number(next.quantity || 0);
      const received = Number(next.received_amount || 0);
      const salesAmount = quantity * unitPrice;
      const productCost = quantity * unitCost;

      return {
        ...next,
        unit,
        unit_price: unitPrice,
        unit_cost: unitCost,
        quantity,
        received_amount: received,
        sales_amount: Math.round(salesAmount * 100) / 100,
        product_cost: Math.round(productCost * 100) / 100,
        gross_profit: Math.round((salesAmount - productCost) * 100) / 100,
        unpaid_amount: Math.round(Math.max(salesAmount - received, 0) * 100) / 100,
      };
    });
  };

  const saveOrder = async () => {
    if (!editing) return;
    const now = new Date().toISOString();
    const normalized: SalesOrder = {
      ...editing,
      id: editing.id || createId(),
      created_at: editing.created_at ?? now,
      updated_at: now,
    };

    const supabase = createSupabaseBrowserClient();
    if (supabase && data.source === "supabase") {
      const { error } = await supabase.from("sales_orders").upsert(normalized);
      if (error) {
        window.alert(error.message);
        return;
      }
    }

    setOrders((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      return exists
        ? current.map((item) => (item.id === normalized.id ? normalized : item))
        : [normalized, ...current];
    });
    setOpen(false);
    setEditing(null);
  };

  const deleteOrder = async (order: SalesOrder) => {
    const supabase = createSupabaseBrowserClient();
    if (supabase && data.source === "supabase") {
      const { error } = await supabase.from("sales_orders").delete().eq("id", order.id);
      if (error) {
        window.alert(error.message);
        return;
      }
    }

    setOrders((current) => current.filter((item) => item.id !== order.id));
  };

  const exportOrders = () => {
    downloadCsv("销售订单.csv", visibleOrders, [
      { label: "订单编号", value: "order_code" },
      { label: "订单日期", value: "order_date" },
      { label: "客户名称", value: (row) => customerMap.get(row.customer_id)?.customer_name ?? "" },
      { label: "产品名称", value: (row) => productMap.get(row.product_id)?.product_name ?? "" },
      { label: "渠道", value: "channel" },
      { label: "数量", value: "quantity" },
      { label: "单位", value: "unit" },
      { label: "单价", value: "unit_price" },
      { label: "销售金额", value: "sales_amount" },
      { label: "已回款金额", value: "received_amount" },
      { label: "未收款金额", value: "unpaid_amount" },
      { label: "备注", value: (row) => row.remark ?? "" },
    ]);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <PagePanel
          title="销售订单管理"
          description="录入销售订单、回款和欠款，首页销售与客户欠款排行会自动引用。"
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportOrders}>
                <Download className="h-4 w-4" />
                导出
              </Button>
              <Button onClick={startCreate}>
                <Plus className="h-4 w-4" />
                新增订单
              </Button>
            </div>
          }
        />

        <Card className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Filter label="月份">
              <Select value={month} onChange={(event) => setMonth(event.target.value)}>
                <option value="all">全部月份</option>
                {monthOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Filter>
            <Filter label="客户">
              <Select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                <option value="all">全部客户</option>
                {data.customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name}
                  </option>
                ))}
              </Select>
            </Filter>
            <Filter label="产品">
              <Select value={productId} onChange={(event) => setProductId(event.target.value)}>
                <option value="all">全部产品</option>
                {data.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
              </Select>
            </Filter>
            <Filter label="渠道">
              <Select value={channel} onChange={(event) => setChannel(event.target.value)}>
                <option value="all">全部渠道</option>
                {CHANNELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Filter>
          </div>
        </Card>

        <div className="grid gap-3 md:hidden">
          {visibleOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">
                    {customerMap.get(order.customer_id)?.customer_name}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {order.order_date} · {productMap.get(order.product_id)?.product_name}
                  </p>
                </div>
                <Badge variant={order.unpaid_amount > order.sales_amount * 0.3 ? "danger" : "default"}>
                  {order.channel}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <Metric label="销售额" value={formatCurrency(order.sales_amount)} />
                <Metric label="已回款" value={formatCurrency(order.received_amount)} />
                <Metric label="未收款" value={formatCurrency(order.unpaid_amount)} danger />
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" variant="outline" onClick={() => startEdit(order)}>
                  <Pencil className="h-4 w-4" />
                  编辑
                </Button>
                <Button className="flex-1" variant="danger" onClick={() => deleteOrder(order)}>
                  <Trash2 className="h-4 w-4" />
                  删除
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="hidden min-w-0 md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-soft">
              <Table className="min-w-[1120px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>订单编号</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>客户</TableHead>
                    <TableHead>产品</TableHead>
                    <TableHead>渠道</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>销售金额</TableHead>
                    <TableHead>已回款</TableHead>
                    <TableHead>未收款</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold text-slate-900">{order.order_code}</TableCell>
                      <TableCell>{order.order_date}</TableCell>
                      <TableCell>{customerMap.get(order.customer_id)?.customer_name}</TableCell>
                      <TableCell>{productMap.get(order.product_id)?.product_name}</TableCell>
                      <TableCell>{order.channel}</TableCell>
                      <TableCell>{formatNumber(order.quantity)} {order.unit}</TableCell>
                      <TableCell>{formatCurrency(order.sales_amount)}</TableCell>
                      <TableCell>{formatCurrency(order.received_amount)}</TableCell>
                      <TableCell className="font-semibold text-amber-700">{formatCurrency(order.unpaid_amount)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEdit(order)}>
                            <Pencil className="h-4 w-4" />
                            编辑
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => deleteOrder(order)}>
                            <Trash2 className="h-4 w-4" />
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <CrudModal
          title={editing?.id ? "编辑销售订单" : "新增销售订单"}
          open={open}
          onClose={() => setOpen(false)}
        >
          {editing ? (
            <div className="space-y-5">
              <FormGrid>
                <Field label="订单编号">
                  <Input value={editing.order_code} onChange={(event) => updateEditing({ order_code: event.target.value })} />
                </Field>
                <Field label="订单日期">
                  <Input type="date" value={editing.order_date} onChange={(event) => updateEditing({ order_date: event.target.value })} />
                </Field>
                <Field label="客户名称">
                  <Select value={editing.customer_id} onChange={(event) => updateEditing({ customer_id: event.target.value })}>
                    {data.customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customer_name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="产品名称">
                  <Select
                    value={editing.product_id}
                    onChange={(event) => {
                      const product = productMap.get(event.target.value);
                      updateEditing({
                        product_id: event.target.value,
                        unit: product?.unit,
                        unit_price: product?.standard_price,
                        unit_cost: product?.unit_cost,
                      });
                    }}
                  >
                    {data.products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="渠道">
                  <Select value={editing.channel} onChange={(event) => updateEditing({ channel: event.target.value })}>
                    {CHANNELS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="数量">
                  <Input type="number" min="0" value={editing.quantity} onChange={(event) => updateEditing({ quantity: Number(event.target.value) })} />
                </Field>
                <Field label="单位">
                  <Input value={editing.unit} onChange={(event) => updateEditing({ unit: event.target.value })} />
                </Field>
                <Field label="单价">
                  <Input type="number" min="0" value={editing.unit_price} onChange={(event) => updateEditing({ unit_price: Number(event.target.value) })} />
                </Field>
                <Field label="单位成本">
                  <Input type="number" min="0" value={editing.unit_cost} onChange={(event) => updateEditing({ unit_cost: Number(event.target.value) })} />
                </Field>
                <Field label="已回款金额">
                  <Input type="number" min="0" value={editing.received_amount} onChange={(event) => updateEditing({ received_amount: Number(event.target.value) })} />
                </Field>
                <Field label="备注" className="sm:col-span-2">
                  <Textarea value={editing.remark ?? ""} onChange={(event) => updateEditing({ remark: event.target.value })} />
                </Field>
              </FormGrid>
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
                <Metric label="销售金额" value={formatCurrency(editing.sales_amount)} />
                <Metric label="商品成本" value={formatCurrency(editing.product_cost)} />
                <Metric label="未收款" value={formatCurrency(editing.unpaid_amount)} danger />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                <Button onClick={saveOrder}>保存</Button>
              </div>
            </div>
          ) : null}
        </CrudModal>
      </div>
    </AppShell>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={danger ? "truncate font-black text-red-600" : "truncate font-black text-slate-950"}>
        {value}
      </p>
    </div>
  );
}
