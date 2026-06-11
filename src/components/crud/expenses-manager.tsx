"use client";

import { useMemo, useState } from "react";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
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
import { BusinessData, Expense, EXPENSE_TYPES } from "@/lib/types";
import { createId, formatCurrency, toMonth } from "@/lib/utils";

export function ExpensesManager({ data }: { data: BusinessData }) {
  const [expenses, setExpenses] = useState(data.expenses);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState("all");
  const [type, setType] = useState("all");

  const monthOptions = useMemo(
    () => Array.from(new Set(expenses.map((expense) => toMonth(expense.expense_date)))).sort(),
    [expenses],
  );
  const visibleExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) =>
          (month === "all" || toMonth(expense.expense_date) === month) &&
          (type === "all" || expense.expense_type === type),
      ),
    [expenses, month, type],
  );

  const startCreate = () => {
    setEditing({
      id: "",
      expense_code: `EX-${Date.now()}`,
      expense_date: new Date().toISOString().slice(0, 10),
      expense_type: "原材料",
      amount: 0,
      remark: "",
    });
    setOpen(true);
  };

  const saveExpense = async () => {
    if (!editing) return;
    const now = new Date().toISOString();
    const normalized: Expense = {
      ...editing,
      id: editing.id || createId(),
      amount: Number(editing.amount || 0),
      created_at: editing.created_at ?? now,
      updated_at: now,
    };
    const supabase = createSupabaseBrowserClient();

    if (supabase && data.source === "supabase") {
      const { error } = await supabase.from("expenses").upsert(normalized);
      if (error) {
        window.alert(error.message);
        return;
      }
    }

    setExpenses((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      return exists
        ? current.map((item) => (item.id === normalized.id ? normalized : item))
        : [normalized, ...current];
    });
    setOpen(false);
    setEditing(null);
  };

  const deleteExpense = async (expense: Expense) => {
    const supabase = createSupabaseBrowserClient();
    if (supabase && data.source === "supabase") {
      const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
      if (error) {
        window.alert(error.message);
        return;
      }
    }
    setExpenses((current) => current.filter((item) => item.id !== expense.id));
  };

  const exportExpenses = () => {
    downloadCsv("支出明细.csv", visibleExpenses, [
      { label: "支出编号", value: "expense_code" },
      { label: "支出日期", value: "expense_date" },
      { label: "支出类型", value: "expense_type" },
      { label: "支出金额", value: "amount" },
      { label: "备注", value: (row) => row.remark ?? "" },
    ]);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <PagePanel
          title="支出管理"
          description="记录原材料、人工、物流、房租水电等工厂期间支出。"
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportExpenses}>
                <Download className="h-4 w-4" />
                导出
              </Button>
              <Button onClick={startCreate}>
                <Plus className="h-4 w-4" />
                新增支出
              </Button>
            </div>
          }
        />

        <Card className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="月份">
              <Select value={month} onChange={(event) => setMonth(event.target.value)}>
                <option value="all">全部月份</option>
                {monthOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="支出类型">
              <Select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="all">全部类型</option>
                {EXPENSE_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <div className="grid gap-3 md:hidden">
          {visibleExpenses.map((expense) => (
            <Card key={expense.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-950">{expense.expense_type}</p>
                  <p className="mt-1 text-xs text-slate-500">{expense.expense_date}</p>
                </div>
                <p className="text-lg font-black text-amber-700">{formatCurrency(expense.amount)}</p>
              </div>
              <p className="mt-3 text-sm text-slate-500">{expense.remark}</p>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" variant="outline" onClick={() => { setEditing(expense); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                  编辑
                </Button>
                <Button className="flex-1" variant="danger" onClick={() => deleteExpense(expense)}>
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
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>支出编号</TableHead>
                    <TableHead>支出日期</TableHead>
                    <TableHead>支出类型</TableHead>
                    <TableHead>支出金额</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-semibold text-slate-900">{expense.expense_code}</TableCell>
                      <TableCell>{expense.expense_date}</TableCell>
                      <TableCell>{expense.expense_type}</TableCell>
                      <TableCell className="font-semibold text-amber-700">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{expense.remark}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditing(expense); setOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                            编辑
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => deleteExpense(expense)}>
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
          title={editing?.id ? "编辑支出" : "新增支出"}
          open={open}
          onClose={() => setOpen(false)}
        >
          {editing ? (
            <div className="space-y-5">
              <FormGrid>
                <Field label="支出编号">
                  <Input value={editing.expense_code} onChange={(event) => setEditing({ ...editing, expense_code: event.target.value })} />
                </Field>
                <Field label="支出日期">
                  <Input type="date" value={editing.expense_date} onChange={(event) => setEditing({ ...editing, expense_date: event.target.value })} />
                </Field>
                <Field label="支出类型">
                  <Select value={editing.expense_type} onChange={(event) => setEditing({ ...editing, expense_type: event.target.value })}>
                    {EXPENSE_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="支出金额">
                  <Input type="number" min="0" value={editing.amount} onChange={(event) => setEditing({ ...editing, amount: Number(event.target.value) })} />
                </Field>
                <Field label="备注" className="sm:col-span-2">
                  <Textarea value={editing.remark ?? ""} onChange={(event) => setEditing({ ...editing, remark: event.target.value })} />
                </Field>
              </FormGrid>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                <Button onClick={saveExpense}>保存</Button>
              </div>
            </div>
          ) : null}
        </CrudModal>
      </div>
    </AppShell>
  );
}
