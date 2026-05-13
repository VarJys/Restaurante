-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create CLIENTS table (Comensales, they do NOT login)
create table public.clients (
    id uuid default uuid_generate_v4() primary key,
    full_name text not null,
    identifier text, -- e.g., Cédula or Student ID
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create PAYMENTS table (Mensualidades)
create table public.payments (
    id uuid default uuid_generate_v4() primary key,
    client_id uuid not null references public.clients(id) on delete cascade,
    amount numeric(10, 2) not null check (amount >= 0),
    start_date date not null,
    end_date date not null check (end_date >= start_date),
    status text not null check (status in ('active', 'expired', 'pending')) default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create CONSUMPTIONS table (Consumos Diarios)
create table public.consumptions (
    id uuid default uuid_generate_v4() primary key,
    client_id uuid not null references public.clients(id) on delete cascade,
    consumption_date date not null default current_date,
    meal_type text not null check (meal_type in ('lunch', 'dinner')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    -- Prevent a client from having more than one lunch or dinner on the same day
    unique (client_id, consumption_date, meal_type)
);

-- 4. Row Level Security (RLS)
-- Since ONLY the administrator logs in (via Supabase Auth), 
-- all policies simply check if auth.uid() is not null.

alter table public.clients enable row level security;
alter table public.payments enable row level security;
alter table public.consumptions enable row level security;

-- Policies for CLIENTS
create policy "Admins have full access to clients" on public.clients
    for all using (auth.uid() is not null);

-- Policies for PAYMENTS
create policy "Admins have full access to payments" on public.payments
    for all using (auth.uid() is not null);

-- Policies for CONSUMPTIONS
create policy "Admins have full access to consumptions" on public.consumptions
    for all using (auth.uid() is not null);

-- (Optional) If you want to automatically update payment status when dates pass
-- You would run this from a cron job, or just calculate it dynamically in the frontend.
