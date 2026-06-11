create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_code text not null unique,
  product_name text not null,
  category text not null,
  unit text not null,
  standard_price numeric(14, 2) not null default 0,
  unit_cost numeric(14, 2) not null default 0,
  status text not null default '启用',
  remark text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text not null unique,
  customer_name text not null,
  customer_type text not null,
  region text,
  contact_name text,
  phone text,
  status text not null default '合作中',
  remark text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  order_date date not null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  channel text not null,
  quantity numeric(14, 2) not null default 0,
  unit text not null,
  unit_price numeric(14, 2) not null default 0,
  unit_cost numeric(14, 2) not null default 0,
  sales_amount numeric(14, 2) not null default 0,
  product_cost numeric(14, 2) not null default 0,
  gross_profit numeric(14, 2) not null default 0,
  received_amount numeric(14, 2) not null default 0,
  unpaid_amount numeric(14, 2) not null default 0,
  remark text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_code text not null unique,
  expense_date date not null,
  expense_type text not null,
  amount numeric(14, 2) not null default 0,
  remark text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sales_orders_order_date on public.sales_orders(order_date);
create index if not exists idx_sales_orders_customer_id on public.sales_orders(customer_id);
create index if not exists idx_sales_orders_product_id on public.sales_orders(product_id);
create index if not exists idx_sales_orders_channel on public.sales_orders(channel);
create index if not exists idx_expenses_expense_date on public.expenses(expense_date);
create index if not exists idx_expenses_expense_type on public.expenses(expense_type);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists trg_sales_orders_updated_at on public.sales_orders;
create trigger trg_sales_orders_updated_at
before update on public.sales_orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();
