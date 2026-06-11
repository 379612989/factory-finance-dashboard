"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BusinessData, Customer } from "@/lib/types";
import { createId } from "@/lib/utils";

const customerTypes = ["批发商", "餐饮客户", "零售客户", "电商客户", "其他"];

export function CustomersManager({ data }: { data: BusinessData }) {
  const [customers, setCustomers] = useState(data.customers);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("all");

  const visibleCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        const hitKeyword = `${customer.customer_code}${customer.customer_name}${customer.region}${customer.contact_name}`
          .toLowerCase()
          .includes(keyword.toLowerCase());
        return hitKeyword && (type === "all" || customer.customer_type === type);
      }),
    [customers, keyword, type],
  );

  const startCreate = () => {
    setEditing({
      id: "",
      customer_code: `C-${String(customers.length + 1).padStart(3, "0")}`,
      customer_name: "",
      customer_type: "批发商",
      region: "",
      contact_name: "",
      phone: "",
      status: "合作中",
      remark: "",
    });
    setOpen(true);
  };

  const saveCustomer = async () => {
    if (!editing) return;
    const now = new Date().toISOString();
    const normalized: Customer = {
      ...editing,
      id: editing.id || createId(),
      created_at: editing.created_at ?? now,
      updated_at: now,
    };
    const supabase = createSupabaseBrowserClient();

    if (supabase && data.source === "supabase") {
      const { error } = await supabase.from("customers").upsert(normalized);
      if (error) {
        window.alert(error.message);
        return;
      }
    }

    setCustomers((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      return exists
        ? current.map((item) => (item.id === normalized.id ? normalized : item))
        : [normalized, ...current];
    });
    setOpen(false);
    setEditing(null);
  };

  const deleteCustomer = async (customer: Customer) => {
    const supabase = createSupabaseBrowserClient();
    if (supabase && data.source === "supabase") {
      const { error } = await supabase.from("customers").delete().eq("id", customer.id);
      if (error) {
        window.alert(error.message);
        return;
      }
    }

    setCustomers((current) => current.filter((item) => item.id !== customer.id));
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <PagePanel
          title="客户管理"
          description="维护客户类型、地区、联系人和状态，客户欠款排行会按订单自动汇总。"
          action={
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4" />
              新增客户
            </Button>
          }
        />

        <Card className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="搜索客户">
              <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="输入客户名称、地区或联系人" />
            </Field>
            <Field label="客户类型">
              <Select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="all">全部类型</option>
                {customerTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <div className="grid gap-3 md:hidden">
          {visibleCustomers.map((customer) => (
            <Card key={customer.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{customer.customer_name}</p>
                  <p className="mt-1 text-xs text-slate-500">{customer.customer_code} · {customer.region}</p>
                </div>
                <Badge variant={customer.status === "合作中" ? "success" : "muted"}>{customer.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">客户类型</p>
                  <p className="font-black text-slate-950">{customer.customer_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">联系人</p>
                  <p className="font-black text-slate-950">{customer.contact_name}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" variant="outline" onClick={() => { setEditing(customer); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                  编辑
                </Button>
                <Button className="flex-1" variant="danger" onClick={() => deleteCustomer(customer)}>
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
              <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>客户编号</TableHead>
                    <TableHead>客户名称</TableHead>
                    <TableHead>客户类型</TableHead>
                    <TableHead>地区</TableHead>
                    <TableHead>联系人</TableHead>
                    <TableHead>联系电话</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-semibold text-slate-900">{customer.customer_code}</TableCell>
                      <TableCell>{customer.customer_name}</TableCell>
                      <TableCell>{customer.customer_type}</TableCell>
                      <TableCell>{customer.region}</TableCell>
                      <TableCell>{customer.contact_name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "合作中" ? "success" : "muted"}>{customer.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditing(customer); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                            编辑
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => deleteCustomer(customer)}>
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
          title={editing?.id ? "编辑客户" : "新增客户"}
          open={open}
          onClose={() => setOpen(false)}
        >
          {editing ? (
            <div className="space-y-5">
              <FormGrid>
                <Field label="客户编号">
                  <Input value={editing.customer_code} onChange={(event) => setEditing({ ...editing, customer_code: event.target.value })} />
                </Field>
                <Field label="客户名称">
                  <Input value={editing.customer_name} onChange={(event) => setEditing({ ...editing, customer_name: event.target.value })} />
                </Field>
                <Field label="客户类型">
                  <Select value={editing.customer_type} onChange={(event) => setEditing({ ...editing, customer_type: event.target.value })}>
                    {customerTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="所在地区">
                  <Input value={editing.region} onChange={(event) => setEditing({ ...editing, region: event.target.value })} />
                </Field>
                <Field label="联系人">
                  <Input value={editing.contact_name} onChange={(event) => setEditing({ ...editing, contact_name: event.target.value })} />
                </Field>
                <Field label="联系电话">
                  <Input value={editing.phone} onChange={(event) => setEditing({ ...editing, phone: event.target.value })} />
                </Field>
                <Field label="状态">
                  <Select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value })}>
                    <option value="合作中">合作中</option>
                    <option value="暂停">暂停</option>
                  </Select>
                </Field>
                <Field label="备注" className="sm:col-span-2">
                  <Textarea value={editing.remark ?? ""} onChange={(event) => setEditing({ ...editing, remark: event.target.value })} />
                </Field>
              </FormGrid>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                <Button onClick={saveCustomer}>保存</Button>
              </div>
            </div>
          ) : null}
        </CrudModal>
      </div>
    </AppShell>
  );
}
