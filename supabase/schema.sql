-- ===========================================
-- POSum DATABASE SCHEMA
-- ===========================================
-- Run this SQL in Supabase SQL Editor to create tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  CONSTRAINT users_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. BANKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo TEXT NOT NULL DEFAULT '🏦',
  default_eft_fee NUMERIC(10,2) NOT NULL DEFAULT 12.80,
  agreement_type TEXT NOT NULL DEFAULT 'standart' CHECK (agreement_type IN ('standart', 'ozel', 'kurumsal')),
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own banks"
  ON public.banks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own banks"
  ON public.banks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banks"
  ON public.banks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own banks"
  ON public.banks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. BRANCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own branches"
  ON public.branches FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 4. POS DEVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pos_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  terminal_no TEXT NOT NULL,
  settlement_type TEXT NOT NULL DEFAULT 'nextDay' CHECK (settlement_type IN ('nextDay', 'blocked', 'hybrid')),
  blocked_days INTEGER,
  hybrid_ratio JSONB,
  monthly_maintenance_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, terminal_no)
);

-- Enable RLS
ALTER TABLE public.pos_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own POS devices"
  ON public.pos_devices FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 5. COMMISSION RATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.commission_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
  pos_id UUID REFERENCES public.pos_devices(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('bireysel', 'ticari')),
  installment_count INTEGER NOT NULL CHECK (installment_count >= 1 AND installment_count <= 12),
  rate NUMERIC(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own commission rates"
  ON public.commission_rates FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 6. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  gross_amount NUMERIC(12,2) NOT NULL CHECK (gross_amount > 0),
  card_type TEXT NOT NULL CHECK (card_type IN ('bireysel', 'ticari')),
  installment_count INTEGER NOT NULL CHECK (installment_count >= 1 AND installment_count <= 12),
  pos_id UUID NOT NULL REFERENCES public.pos_devices(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
  commission_rate NUMERIC(5,2),
  commission_amount NUMERIC(12,2),
  net_amount NUMERIC(12,2),
  eft_fee NUMERIC(10,2),
  final_amount NUMERIC(12,2),
  value_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'beklemede' CHECK (status IN ('beklemede', 'islendi', 'transfer_edildi')),
  card_last_four TEXT,
  auth_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Banks indexes
CREATE INDEX IF NOT EXISTS idx_banks_user_id ON public.banks(user_id);

-- Branches indexes
CREATE INDEX IF NOT EXISTS idx_branches_user_id ON public.branches(user_id);

-- POS Devices indexes
CREATE INDEX IF NOT EXISTS idx_pos_devices_user_id ON public.pos_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_devices_bank_id ON public.pos_devices(bank_id);
CREATE INDEX IF NOT EXISTS idx_pos_devices_branch_id ON public.pos_devices(branch_id);
CREATE INDEX IF NOT EXISTS idx_pos_devices_is_active ON public.pos_devices(is_active);

-- Commission Rates indexes
CREATE INDEX IF NOT EXISTS idx_commission_rates_user_id ON public.commission_rates(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_rates_bank_id ON public.commission_rates(bank_id);
CREATE INDEX IF NOT EXISTS idx_commission_rates_pos_id ON public.commission_rates(pos_id);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_id ON public.transactions(bank_id);
CREATE INDEX IF NOT EXISTS idx_transactions_pos_id ON public.transactions(pos_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_value_date ON public.transactions(value_date);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_banks_updated_at
  BEFORE UPDATE ON public.banks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pos_devices_updated_at
  BEFORE UPDATE ON public.pos_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_rates_updated_at
  BEFORE UPDATE ON public.commission_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER FOR NEW USER PROFILE
-- ============================================

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on sign up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional - for development)
-- ============================================

-- Uncomment below to insert sample data
/*
-- Sample branch
INSERT INTO public.branches (id, user_id, name, location, city)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  auth.uid(),
  'Ana Şube',
  'Merkez Mahallesi',
  'İstanbul'
);
*/
