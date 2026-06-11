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
import { BusinessData, Product } from "@/lib/types";
import { createId, formatCurrency } from "@/lib/utils";

export function ProductsManager({ data }: { data: BusinessData }) {
  const [products, setProducts] = useState(data.products);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const visibleProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.product_code}${product.product_name}${product.category}`
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      ),
    [products, keyword],
  );

  const startCreate = () => {
    setEditing({
      id: "",
      product_code: `P-${String(products.length + 1).padStart(3, "0")}`,
      product_name: "",
      category: "鸡精",
      unit: "袋",
      standard_price: 0,
      unit_cost: 0,
      status: "启用",
      remark: "",
    });
    setOpen(true);
  };

  const saveProduct = async () => {
    if (!editing) return;
    const now = new Date().toISOString();
    const normalized: Product = {
      ...editing,
      id: editing.id || createId(),
      standard_price: Number(editing.standard_price || 0),
      unit_cost: Number(editing.unit_cost || 0),
      created_at: editing.created_at ?? now,
      updated_at: now,
    };
    const supabase = createSupabaseBrowserClient();

    if (supabase && data.source === "supabase") {
      const { error } = await supabase.from("products").upsert(normalized);
      if (error) {
        window.alert(error.message);
        return;
      }
    }

    setProducts((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      return exists
        ? current.map((item) => (item.id === normalized.id ? normalized : item))
        : [normalized, ...current];
    });
    setOpen(false);
    setEditing(null);
  };

  const deleteProduct = async (product: Product) => {
    const supabase = createSupabaseBrowserClient();
    if (supabase && data.source === "supabase") {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) {
        window.alert(error.message);
        return;
      }
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <PagePanel
          title="产品管理"
          description="维护产品售价、单位成本和启用状态，为订单录入和产品利润排行提供基础数据。"
          action={
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4" />
              新增产品
            </Button>
          }
        />

        <Card className="p-4">
          <Field label="搜索产品">
            <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="输入产品编号、名称或分类" />
          </Field>
        </Card>

        <div className="grid gap-3 md:hidden">
          {visibleProducts.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{product.product_name}</p>
                  <p className="mt-1 text-xs text-slate-500">{product.product_code} · {product.category}</p>
                </div>
                <Badge variant={product.status === "启用" ? "success" : "muted"}>{product.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">标准售价</p>
                  <p className="font-black text-slate-950">{formatCurrency(product.standard_price)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">单位成本</p>
                  <p className="font-black text-slate-950">{formatCurrency(product.unit_cost)}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" variant="outline" onClick={() => { setEditing(product); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                  编辑
                </Button>
                <Button className="flex-1" variant="danger" onClick={() => deleteProduct(product)}>
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
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>产品编号</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>单位</TableHead>
                    <TableHead>标准售价</TableHead>
                    <TableHead>单位成本</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-semibold text-slate-900">{product.product_code}</TableCell>
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{formatCurrency(product.standard_price)}</TableCell>
                      <TableCell>{formatCurrency(product.unit_cost)}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === "启用" ? "success" : "muted"}>{product.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditing(product); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                            编辑
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => deleteProduct(product)}>
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
          title={editing?.id ? "编辑产品" : "新增产品"}
          open={open}
          onClose={() => setOpen(false)}
        >
          {editing ? (
            <div className="space-y-5">
              <FormGrid>
                <Field label="产品编号">
                  <Input value={editing.product_code} onChange={(event) => setEditing({ ...editing, product_code: event.target.value })} />
                </Field>
                <Field label="产品名称">
                  <Input value={editing.product_name} onChange={(event) => setEditing({ ...editing, product_name: event.target.value })} />
                </Field>
                <Field label="产品分类">
                  <Input value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} />
                </Field>
                <Field label="单位">
                  <Input value={editing.unit} onChange={(event) => setEditing({ ...editing, unit: event.target.value })} />
                </Field>
                <Field label="标准售价">
                  <Input type="number" min="0" value={editing.standard_price} onChange={(event) => setEditing({ ...editing, standard_price: Number(event.target.value) })} />
                </Field>
                <Field label="单位成本">
                  <Input type="number" min="0" value={editing.unit_cost} onChange={(event) => setEditing({ ...editing, unit_cost: Number(event.target.value) })} />
                </Field>
                <Field label="状态">
                  <Select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value })}>
                    <option value="启用">启用</option>
                    <option value="停用">停用</option>
                  </Select>
                </Field>
                <Field label="备注" className="sm:col-span-2">
                  <Textarea value={editing.remark ?? ""} onChange={(event) => setEditing({ ...editing, remark: event.target.value })} />
                </Field>
              </FormGrid>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                <Button onClick={saveProduct}>保存</Button>
              </div>
            </div>
          ) : null}
        </CrudModal>
      </div>
    </AppShell>
  );
}
