import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, digits = 0) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCompactCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (Math.abs(safeValue) >= 10000) {
    return `${(safeValue / 10000).toFixed(1)}万`;
  }

  return formatCurrency(safeValue, 0);
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number, digits = 1) {
  if (!Number.isFinite(value)) return "--";
  return `${(value * 100).toFixed(digits)}%`;
}

export function toMonth(date: string) {
  return date.slice(0, 7);
}

export function toYear(date: string) {
  return date.slice(0, 4);
}

export function monthLabel(month: string) {
  return `${Number(month)}月`;
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
