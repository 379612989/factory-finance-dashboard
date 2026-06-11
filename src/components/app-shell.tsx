"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Factory,
  LayoutDashboard,
  ReceiptText,
  ShoppingCart,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "经营看板", icon: LayoutDashboard },
  { href: "/orders", label: "销售订单", icon: ShoppingCart },
  { href: "/expenses", label: "支出管理", icon: ReceiptText },
  { href: "/products", label: "产品管理", icon: Boxes },
  { href: "/customers", label: "客户管理", icon: Users },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/70 bg-white/88 px-4 py-5 shadow-[12px_0_35px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:block">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Factory className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">小微工厂</p>
            <p className="text-lg font-bold text-slate-950">经营财务看板</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition",
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
            <BarChart3 className="h-4 w-4" />
            今日关注
          </div>
          <p className="mt-2 text-sm leading-6 text-blue-700">
            优先看净利润、未收款和客户欠款排行，快速判断经营压力。
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Factory className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold text-slate-950">
                小微工厂经营看板
              </span>
              <span className="block truncate text-xs text-slate-500">
                销售、利润、回款一屏掌握
              </span>
            </span>
          </Link>
        </div>
      </header>

      <main className="min-w-0 pb-24 lg:ml-64 lg:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1 shadow-[0_-12px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold transition",
                active ? "bg-blue-50 text-blue-700" : "text-slate-500",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
