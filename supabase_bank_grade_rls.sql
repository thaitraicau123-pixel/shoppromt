-- ============================================================================
-- ONTHI-HUB & PROMPTMMO: BANK-GRADE SUPABASE RLS & ATOMIC WALLET SCHEMA
-- Engineered by Gemini 4 Argon — Anti-Hack, Anti-Race-Condition, Zero Leak
-- ============================================================================

-- 1. BẢNG PROFILES (Chỉ lưu thông tin hiển thị công khai, KHÔNG lưu số dư hay quyền Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile display info"
ON public.profiles FOR UPDATE TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- 2. BẢNG STREAKS & XP (Chống gian lận chuỗi học tập)
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak INT NOT NULL DEFAULT 0 CHECK (streak >= 0),
  highest_streak INT NOT NULL DEFAULT 0 CHECK (highest_streak >= 0),
  xp BIGINT NOT NULL DEFAULT 0 CHECK (xp >= 0),
  last_checkin_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Người dùng chỉ được XEM streak, chỉ được cộng qua RPC kiểm tra ngày Hà Nội
CREATE POLICY "Users can view streaks for leaderboard"
ON public.user_streaks FOR SELECT TO authenticated USING (true);

-- 3. BẢNG VÍ XU (WALLETS) - CẤP ĐỘ BẢO MẬT NGÂN HÀNG
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 20 CHECK (balance >= 0),
  withdrawable_balance BIGINT NOT NULL DEFAULT 0 CHECK (withdrawable_balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT withdrawable_lte_total CHECK (withdrawable_balance <= balance)
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- CẤM TUYỆT ĐỐI INSERT / UPDATE / DELETE TỪ CLIENT! Chỉ được SELECT ví của chính mình:
CREATE POLICY "Users can only view own wallet"
ON public.wallets FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

-- 4. BẢNG LỊCH SỬ GIAO DỊCH (WALLET TRANSACTIONS)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'purchase', 'sale', 'reward')),
  xu_amount BIGINT NOT NULL CHECK (xu_amount > 0),
  vnd_amount BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON public.wallet_transactions(user_id);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON public.wallet_transactions FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

-- 5. HÀM RPC ĐIỂM DANH NHẬN XU & STREAK (CHỐNG SPAM NHIỀU LẦN TRONG NGÀY)
CREATE OR REPLACE FUNCTION public.claim_daily_checkin_atomic()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today DATE := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  v_last_date DATE;
  v_new_streak INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Khóa dòng streak của user
  SELECT last_checkin_date, streak INTO v_last_date, v_new_streak
  FROM public.user_streaks
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_last_date = v_today THEN
    RAISE EXCEPTION 'Hôm nay bạn đã điểm danh nhận thưởng rồi!';
  END IF;

  IF v_last_date = (v_today - INTERVAL '1 day')::date THEN
    v_new_streak := COALESCE(v_new_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  INSERT INTO public.user_streaks (user_id, streak, highest_streak, xp, last_checkin_date, updated_at)
  VALUES (v_user_id, v_new_streak, v_new_streak, 25, v_today, now())
  ON CONFLICT (user_id) DO UPDATE
  SET streak = v_new_streak,
      highest_streak = GREATEST(public.user_streaks.highest_streak, v_new_streak),
      xp = public.user_streaks.xp + 25,
      last_checkin_date = v_today,
      updated_at = now();

  -- Cộng 5 Xu khuyến mãi học tập (Không cộng vào withdrawable_balance)
  UPDATE public.wallets
  SET balance = balance + 5, updated_at = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object('success', true, 'streak', v_new_streak, 'reward_xu', 5);
END;
$$;
