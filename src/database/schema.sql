-- ================================================================
-- myLaundry Database Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- 1. Tabel profiles (extend auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  branch      TEXT NOT NULL,
  full_name   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- 2. Tabel customers
CREATE TABLE IF NOT EXISTS public.customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch      TEXT NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  address     TEXT,
  total_orders INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_branch" ON public.customers
  FOR ALL USING (
    branch = (SELECT branch FROM public.profiles WHERE id = auth.uid())
  );

-- 3. Tabel orders
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,
  branch          TEXT NOT NULL,
  customer_id     UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  package_type    TEXT NOT NULL CHECK (package_type IN ('Reguler', 'Express')),
  service_type    TEXT NOT NULL CHECK (service_type IN ('kiloan', 'satuan')),
  service_id      TEXT NOT NULL,
  service_label   TEXT NOT NULL,
  quantity        NUMERIC NOT NULL DEFAULT 1,
  unit            TEXT NOT NULL DEFAULT 'kg',
  price_per_unit  NUMERIC NOT NULL,
  total_price     NUMERIC NOT NULL,
  wash_status     TEXT NOT NULL DEFAULT 'pending' CHECK (wash_status IN ('pending', 'process', 'done')),
  payment_status  TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  amount_paid     NUMERIC NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_branch" ON public.orders
  FOR ALL USING (
    branch = (SELECT branch FROM public.profiles WHERE id = auth.uid())
  );

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_orders_branch ON public.orders(branch);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- 4. Tabel payments
CREATE TABLE IF NOT EXISTS public.payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch        TEXT NOT NULL,
  order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number  TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount        NUMERIC NOT NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_branch" ON public.payments
  FOR ALL USING (
    branch = (SELECT branch FROM public.profiles WHERE id = auth.uid())
  );

-- 5. Tabel kas (pemasukan/pengeluaran bebas)
CREATE TABLE IF NOT EXISTS public.cash_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch      TEXT NOT NULL,
  name        TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  type        TEXT NOT NULL DEFAULT 'in' CHECK (type IN ('in', 'out')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cash_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cash_branch" ON public.cash_entries
  FOR ALL USING (
    branch = (SELECT branch FROM public.profiles WHERE id = auth.uid())
  );

-- ================================================================
-- Trigger: update orders.updated_at otomatis
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- Seed Users (jalankan SETELAH membuat akun di Supabase Auth)
-- Cara: Supabase Dashboard → Authentication → Users → Add User
-- Buat 4 akun ini:
--   semarang@mylaundry.id  / pass: Laundry@2026
--   jakarta@mylaundry.id   / pass: Laundry@2026
--   surabaya@mylaundry.id  / pass: Laundry@2026
--   bandung@mylaundry.id   / pass: Laundry@2026
-- Lalu jalankan insert profiles di bawah dengan UUID dari Auth
-- ================================================================

-- Contoh insert profiles (ganti UUID sesuai hasil Auth):
-- INSERT INTO public.profiles (id, email, branch, full_name) VALUES
--   ('<uuid-semarang>',  'semarang@mylaundry.id',  'Semarang',  'Admin Semarang'),
--   ('<uuid-jakarta>',   'jakarta@mylaundry.id',   'Jakarta',   'Admin Jakarta'),
--   ('<uuid-surabaya>',  'surabaya@mylaundry.id',  'Surabaya',  'Admin Surabaya'),
--   ('<uuid-bandung>',   'bandung@mylaundry.id',   'Bandung',   'Admin Bandung');