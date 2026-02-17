-- =====================================================================
-- MIGRAÇÃO 00012 – Sistema de Assinaturas e Monetização
-- Execute no Supabase SQL Editor
-- Adiciona: subscriptions, daily_usage, consumable_balance,
--           purchase_history, funções RPC de limites, RLS
-- =====================================================================

-- =====================================================================
-- 1. TABELA DE ASSINATURAS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'light', 'premium_plus')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'trial', 'grace_period')),
  provider TEXT CHECK (provider IN ('apple', 'google', 'stripe', 'manual')),
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================================
-- 2. TABELA DE USO DIÁRIO (limites de likes, super likes, etc.)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  likes_used INTEGER NOT NULL DEFAULT 0,
  super_likes_used INTEGER NOT NULL DEFAULT 0,
  rewinds_used INTEGER NOT NULL DEFAULT 0,
  boosts_used INTEGER NOT NULL DEFAULT 0,
  profiles_viewed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- =====================================================================
-- 3. TABELA DE SALDO DE CONSUMÍVEIS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.consumable_balance (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  super_likes INTEGER NOT NULL DEFAULT 0,
  boosts INTEGER NOT NULL DEFAULT 0,
  rewinds INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================================
-- 4. TABELA DE HISTÓRICO DE COMPRAS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.purchase_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'consumable')),
  plan TEXT CHECK (plan IN ('light', 'premium_plus')),
  amount_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'BRL',
  provider TEXT NOT NULL CHECK (provider IN ('apple', 'google', 'stripe')),
  provider_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 5. TABELA DE "QUEM TE CURTIU" (para feature gating)
-- =====================================================================
-- Já existe em interactions, mas criamos uma view otimizada
CREATE OR REPLACE VIEW public.received_likes AS
SELECT
  i.target_user_id AS user_id,
  i.user_id AS liker_id,
  p.full_name AS liker_name,
  p.avatar_url AS liker_avatar,
  p.bio AS liker_bio,
  EXTRACT(YEAR FROM AGE(p.birth_date))::integer AS liker_age,
  i.created_at
FROM public.interactions i
JOIN public.profiles p ON p.id = i.user_id
WHERE i.action = 'like'
  -- Excluir quem já é match (não precisa mais aparecer)
  AND NOT EXISTS (
    SELECT 1 FROM public.matches m
    WHERE (m.user1_id = LEAST(i.user_id, i.target_user_id)
       AND m.user2_id = GREATEST(i.user_id, i.target_user_id))
  )
  -- Excluir se o target já deu like de volta (já é match via trigger)
  AND NOT EXISTS (
    SELECT 1 FROM public.interactions i2
    WHERE i2.user_id = i.target_user_id
      AND i2.target_user_id = i.user_id
  )
ORDER BY i.created_at DESC;

-- =====================================================================
-- 6. ÍNDICES DE PERFORMANCE
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON public.daily_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_consumable_balance_user ON public.consumable_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_user ON public.purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_target_action ON public.interactions(target_user_id, action);

-- =====================================================================
-- 7. FUNÇÕES RPC
-- =====================================================================

-- 7.1 Obter plano ativo do usuário
DROP FUNCTION IF EXISTS public.get_user_plan(uuid);
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id uuid)
RETURNS TABLE(
  plan text,
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  -- Limites baseados no plano
  daily_like_limit integer,
  daily_super_like_limit integer,
  daily_rewind_limit integer,
  can_see_who_liked boolean,
  can_use_advanced_filters boolean,
  can_boost boolean,
  can_go_incognito boolean,
  has_read_receipts boolean,
  is_ad_free boolean,
  feed_boost_multiplier float,
  -- Uso de hoje
  likes_used_today integer,
  super_likes_used_today integer,
  rewinds_used_today integer,
  boosts_used_today integer,
  -- Saldo de consumíveis
  consumable_super_likes integer,
  consumable_boosts integer,
  consumable_rewinds integer,
  -- Contagem de quem curtiu
  pending_likes_count integer
) AS $$
DECLARE
  v_plan text := 'free';
  v_status text := 'active';
  v_period_end timestamptz;
  v_cancel boolean := false;
BEGIN
  -- Buscar assinatura ativa
  SELECT s.plan, s.status, s.current_period_end, s.cancel_at_period_end
  INTO v_plan, v_status, v_period_end, v_cancel
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trial', 'grace_period')
    AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  ORDER BY
    CASE s.plan
      WHEN 'premium_plus' THEN 1
      WHEN 'light' THEN 2
      ELSE 3
    END
  LIMIT 1;

  -- Se não encontrou assinatura ativa, é free
  IF v_plan IS NULL THEN
    v_plan := 'free';
    v_status := 'active';
    v_cancel := false;
  END IF;

  RETURN QUERY
  SELECT
    v_plan,
    v_status,
    v_period_end,
    v_cancel,
    -- Limites por plano
    CASE v_plan
      WHEN 'free' THEN 10
      WHEN 'light' THEN -1  -- -1 = ilimitado
      WHEN 'premium_plus' THEN -1
      ELSE 10
    END AS daily_like_limit,
    CASE v_plan
      WHEN 'free' THEN 1
      WHEN 'light' THEN 3
      WHEN 'premium_plus' THEN 5
      ELSE 1
    END AS daily_super_like_limit,
    CASE v_plan
      WHEN 'free' THEN 0
      WHEN 'light' THEN 5
      WHEN 'premium_plus' THEN -1
      ELSE 0
    END AS daily_rewind_limit,
    CASE v_plan
      WHEN 'premium_plus' THEN true
      ELSE false
    END AS can_see_who_liked,
    CASE v_plan
      WHEN 'free' THEN false
      ELSE true
    END AS can_use_advanced_filters,
    CASE v_plan
      WHEN 'free' THEN false
      ELSE true
    END AS can_boost,
    CASE v_plan
      WHEN 'premium_plus' THEN true
      ELSE false
    END AS can_go_incognito,
    CASE v_plan
      WHEN 'premium_plus' THEN true
      ELSE false
    END AS has_read_receipts,
    CASE v_plan
      WHEN 'free' THEN false
      ELSE true
    END AS is_ad_free,
    CASE v_plan
      WHEN 'premium_plus' THEN 3.0
      WHEN 'light' THEN 1.5
      ELSE 1.0
    END AS feed_boost_multiplier,
    -- Uso de hoje
    COALESCE(du.likes_used, 0),
    COALESCE(du.super_likes_used, 0),
    COALESCE(du.rewinds_used, 0),
    COALESCE(du.boosts_used, 0),
    -- Saldo de consumíveis
    COALESCE(cb.super_likes, 0),
    COALESCE(cb.boosts, 0),
    COALESCE(cb.rewinds, 0),
    -- Contagem de quem curtiu
    (
      SELECT COUNT(*)::integer
      FROM public.interactions i
      WHERE i.target_user_id = p_user_id
        AND i.action = 'like'
        AND NOT EXISTS (
          SELECT 1 FROM public.matches m
          WHERE (m.user1_id = LEAST(i.user_id, i.target_user_id)
             AND m.user2_id = GREATEST(i.user_id, i.target_user_id))
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.interactions i2
          WHERE i2.user_id = i.target_user_id
            AND i2.target_user_id = i.user_id
        )
    )
  FROM (SELECT 1) AS dummy
  LEFT JOIN public.daily_usage du
    ON du.user_id = p_user_id AND du.usage_date = CURRENT_DATE
  LEFT JOIN public.consumable_balance cb
    ON cb.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.2 Incrementar uso diário (retorna se ação foi permitida)
DROP FUNCTION IF EXISTS public.use_daily_action(uuid, text);
CREATE OR REPLACE FUNCTION public.use_daily_action(
  p_user_id uuid,
  p_action_type text  -- 'like', 'super_like', 'rewind', 'boost'
)
RETURNS TABLE(
  allowed boolean,
  remaining integer,
  plan text
) AS $$
DECLARE
  v_plan text := 'free';
  v_limit integer;
  v_used integer;
  v_consumable integer := 0;
  v_allowed boolean := false;
  v_remaining integer := 0;
BEGIN
  -- Buscar plano
  SELECT s.plan INTO v_plan
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trial', 'grace_period')
    AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  ORDER BY
    CASE s.plan WHEN 'premium_plus' THEN 1 WHEN 'light' THEN 2 ELSE 3 END
  LIMIT 1;

  IF v_plan IS NULL THEN v_plan := 'free'; END IF;

  -- Criar registro de uso diário se não existir
  INSERT INTO public.daily_usage (user_id, usage_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  -- Criar registro de consumíveis se não existir
  INSERT INTO public.consumable_balance (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Determinar limite e uso atual
  IF p_action_type = 'like' THEN
    v_limit := CASE v_plan WHEN 'free' THEN 10 WHEN 'light' THEN -1 WHEN 'premium_plus' THEN -1 ELSE 10 END;
    SELECT du.likes_used INTO v_used FROM public.daily_usage du WHERE du.user_id = p_user_id AND du.usage_date = CURRENT_DATE;
  ELSIF p_action_type = 'super_like' THEN
    v_limit := CASE v_plan WHEN 'free' THEN 1 WHEN 'light' THEN 3 WHEN 'premium_plus' THEN 5 ELSE 1 END;
    SELECT du.super_likes_used INTO v_used FROM public.daily_usage du WHERE du.user_id = p_user_id AND du.usage_date = CURRENT_DATE;
    SELECT cb.super_likes INTO v_consumable FROM public.consumable_balance cb WHERE cb.user_id = p_user_id;
  ELSIF p_action_type = 'rewind' THEN
    v_limit := CASE v_plan WHEN 'free' THEN 0 WHEN 'light' THEN 5 WHEN 'premium_plus' THEN -1 ELSE 0 END;
    SELECT du.rewinds_used INTO v_used FROM public.daily_usage du WHERE du.user_id = p_user_id AND du.usage_date = CURRENT_DATE;
    SELECT cb.rewinds INTO v_consumable FROM public.consumable_balance cb WHERE cb.user_id = p_user_id;
  ELSIF p_action_type = 'boost' THEN
    v_limit := CASE v_plan WHEN 'free' THEN 0 WHEN 'light' THEN 1 WHEN 'premium_plus' THEN 1 ELSE 0 END;
    SELECT du.boosts_used INTO v_used FROM public.daily_usage du WHERE du.user_id = p_user_id AND du.usage_date = CURRENT_DATE;
    SELECT cb.boosts INTO v_consumable FROM public.consumable_balance cb WHERE cb.user_id = p_user_id;
  ELSE
    RETURN QUERY SELECT false, 0, v_plan;
    RETURN;
  END IF;

  v_used := COALESCE(v_used, 0);
  v_consumable := COALESCE(v_consumable, 0);

  -- Verificar se ação é permitida
  IF v_limit = -1 THEN
    -- Ilimitado
    v_allowed := true;
    v_remaining := -1;
  ELSIF v_used < v_limit THEN
    -- Dentro do limite diário
    v_allowed := true;
    v_remaining := v_limit - v_used - 1;
  ELSIF v_consumable > 0 AND p_action_type IN ('super_like', 'rewind', 'boost') THEN
    -- Usar consumível comprado
    v_allowed := true;
    v_remaining := v_consumable - 1;
    
    -- Decrementar consumível
    IF p_action_type = 'super_like' THEN
      UPDATE public.consumable_balance SET super_likes = super_likes - 1, updated_at = NOW() WHERE user_id = p_user_id;
    ELSIF p_action_type = 'rewind' THEN
      UPDATE public.consumable_balance SET rewinds = rewinds - 1, updated_at = NOW() WHERE user_id = p_user_id;
    ELSIF p_action_type = 'boost' THEN
      UPDATE public.consumable_balance SET boosts = boosts - 1, updated_at = NOW() WHERE user_id = p_user_id;
    END IF;
    
    RETURN QUERY SELECT v_allowed, v_remaining, v_plan;
    RETURN;
  ELSE
    -- Limite atingido
    v_allowed := false;
    v_remaining := 0;
    RETURN QUERY SELECT v_allowed, v_remaining, v_plan;
    RETURN;
  END IF;

  -- Incrementar uso
  IF v_allowed THEN
    IF p_action_type = 'like' THEN
      UPDATE public.daily_usage SET likes_used = likes_used + 1 WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    ELSIF p_action_type = 'super_like' THEN
      UPDATE public.daily_usage SET super_likes_used = super_likes_used + 1 WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    ELSIF p_action_type = 'rewind' THEN
      UPDATE public.daily_usage SET rewinds_used = rewinds_used + 1 WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    ELSIF p_action_type = 'boost' THEN
      UPDATE public.daily_usage SET boosts_used = boosts_used + 1 WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    END IF;
  END IF;

  RETURN QUERY SELECT v_allowed, v_remaining, v_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.3 Obter quem curtiu (com blur para free users)
DROP FUNCTION IF EXISTS public.get_who_liked_me(uuid);
CREATE OR REPLACE FUNCTION public.get_who_liked_me(p_user_id uuid)
RETURNS TABLE(
  liker_id uuid,
  liker_name text,
  liker_avatar text,
  liker_age integer,
  is_blurred boolean,
  liked_at timestamptz,
  total_count integer
) AS $$
DECLARE
  v_plan text := 'free';
  v_total integer;
BEGIN
  -- Buscar plano
  SELECT s.plan INTO v_plan
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trial', 'grace_period')
    AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  ORDER BY
    CASE s.plan WHEN 'premium_plus' THEN 1 WHEN 'light' THEN 2 ELSE 3 END
  LIMIT 1;

  IF v_plan IS NULL THEN v_plan := 'free'; END IF;

  -- Contar total
  SELECT COUNT(*)::integer INTO v_total
  FROM public.received_likes rl
  WHERE rl.user_id = p_user_id;

  RETURN QUERY
  SELECT
    rl.liker_id,
    CASE WHEN v_plan = 'premium_plus' THEN rl.liker_name ELSE NULL END,
    CASE WHEN v_plan = 'premium_plus' THEN rl.liker_avatar ELSE NULL END,
    CASE WHEN v_plan = 'premium_plus' THEN rl.liker_age ELSE NULL END,
    CASE WHEN v_plan = 'premium_plus' THEN false ELSE true END,
    rl.created_at,
    v_total
  FROM public.received_likes rl
  WHERE rl.user_id = p_user_id
  ORDER BY rl.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.4 Atualizar assinatura (chamada pelo webhook do RevenueCat)
DROP FUNCTION IF EXISTS public.update_subscription(uuid, text, text, text, text, timestamptz, timestamptz);
CREATE OR REPLACE FUNCTION public.update_subscription(
  p_user_id uuid,
  p_plan text,
  p_status text,
  p_provider text,
  p_provider_subscription_id text,
  p_period_start timestamptz,
  p_period_end timestamptz
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_id, plan, status, provider, provider_subscription_id,
    current_period_start, current_period_end, updated_at
  )
  VALUES (
    p_user_id, p_plan, p_status, p_provider, p_provider_subscription_id,
    p_period_start, p_period_end, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    provider = EXCLUDED.provider,
    provider_subscription_id = EXCLUDED.provider_subscription_id,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.5 Adicionar consumíveis (chamada após compra avulsa)
DROP FUNCTION IF EXISTS public.add_consumables(uuid, integer, integer, integer);
CREATE OR REPLACE FUNCTION public.add_consumables(
  p_user_id uuid,
  p_super_likes integer DEFAULT 0,
  p_boosts integer DEFAULT 0,
  p_rewinds integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.consumable_balance (user_id, super_likes, boosts, rewinds, updated_at)
  VALUES (p_user_id, p_super_likes, p_boosts, p_rewinds, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    super_likes = consumable_balance.super_likes + p_super_likes,
    boosts = consumable_balance.boosts + p_boosts,
    rewinds = consumable_balance.rewinds + p_rewinds,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 8. ATUALIZAR get_recommendations PARA CONSIDERAR BOOST
-- =====================================================================
-- Perfis com assinatura Premium+ ou Light aparecem com maior score
DROP FUNCTION IF EXISTS public.get_recommendations(uuid) CASCADE;
CREATE OR REPLACE FUNCTION get_recommendations(current_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  interests text[],
  age integer,
  recommendation_score float,
  user_plan text
) AS $$
DECLARE
  current_user_location geography;
  max_distance float := 50000;
BEGIN
  SELECT p.location INTO current_user_location
  FROM public.profiles p
  WHERE p.id = current_user_id;

  RETURN QUERY
  WITH user_interests AS (
    SELECT p_inner.interests
    FROM public.profiles p_inner
    WHERE p_inner.id = current_user_id
  ),
  scores AS (
    SELECT
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.bio,
      p.interests,
      EXTRACT(YEAR FROM AGE(p.birth_date))::integer AS age,
      CASE
        WHEN current_user_location IS NOT NULL AND p.location IS NOT NULL THEN
          (1 - LEAST(ST_Distance(current_user_location, p.location) / max_distance, 1.0))
        ELSE 0.0
      END AS distance_score,
      count_common_elements(ui.interests, p.interests) AS interest_score,
      -- Boost de plano pago
      COALESCE(
        (SELECT 
          CASE sub.plan 
            WHEN 'premium_plus' THEN 3.0
            WHEN 'light' THEN 1.5
            ELSE 1.0
          END
        FROM public.subscriptions sub
        WHERE sub.user_id = p.id
          AND sub.status IN ('active', 'trial')
          AND (sub.current_period_end IS NULL OR sub.current_period_end > NOW())
        ),
        1.0
      ) AS plan_boost,
      COALESCE(
        (SELECT sub.plan FROM public.subscriptions sub
         WHERE sub.user_id = p.id
           AND sub.status IN ('active', 'trial')
           AND (sub.current_period_end IS NULL OR sub.current_period_end > NOW())
        ),
        'free'
      ) AS user_plan
    FROM
      public.profiles p, user_interests ui
    WHERE
      p.id != current_user_id
      AND NOT EXISTS (
        SELECT 1 FROM public.interactions i
        WHERE i.user_id = current_user_id AND i.target_user_id = p.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.matches m
        WHERE (m.user1_id = current_user_id AND m.user2_id = p.id)
           OR (m.user2_id = current_user_id AND m.user1_id = p.id)
      )
  )
  SELECT
    s.id,
    s.username,
    s.full_name,
    s.avatar_url,
    s.bio,
    s.interests,
    s.age,
    ((COALESCE(s.distance_score, 0) * 0.6 + COALESCE(s.interest_score, 0) * 0.4) * s.plan_boost)::float AS recommendation_score,
    s.user_plan
  FROM
    scores s
  ORDER BY
    recommendation_score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================================

-- --- SUBSCRIPTIONS ---
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Bloquear INSERT/UPDATE/DELETE direto (gerenciado por SECURITY DEFINER functions)
DROP POLICY IF EXISTS "Block client-side insert on subscriptions" ON public.subscriptions;
CREATE POLICY "Block client-side insert on subscriptions"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Block client-side update on subscriptions" ON public.subscriptions;
CREATE POLICY "Block client-side update on subscriptions"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Block client-side delete on subscriptions" ON public.subscriptions;
CREATE POLICY "Block client-side delete on subscriptions"
ON public.subscriptions FOR DELETE
TO authenticated
USING (false);

-- --- DAILY USAGE ---
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own usage" ON public.daily_usage;
CREATE POLICY "Users can view their own usage"
ON public.daily_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Gerenciado por SECURITY DEFINER
DROP POLICY IF EXISTS "Block client-side insert on daily_usage" ON public.daily_usage;
CREATE POLICY "Block client-side insert on daily_usage"
ON public.daily_usage FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Block client-side update on daily_usage" ON public.daily_usage;
CREATE POLICY "Block client-side update on daily_usage"
ON public.daily_usage FOR UPDATE
TO authenticated
USING (false) WITH CHECK (false);

-- --- CONSUMABLE BALANCE ---
ALTER TABLE public.consumable_balance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own consumables" ON public.consumable_balance;
CREATE POLICY "Users can view their own consumables"
ON public.consumable_balance FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Block client-side insert on consumables" ON public.consumable_balance;
CREATE POLICY "Block client-side insert on consumables"
ON public.consumable_balance FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "Block client-side update on consumables" ON public.consumable_balance;
CREATE POLICY "Block client-side update on consumables"
ON public.consumable_balance FOR UPDATE
TO authenticated
USING (false) WITH CHECK (false);

-- --- PURCHASE HISTORY ---
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchase_history;
CREATE POLICY "Users can view their own purchases"
ON public.purchase_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Block client-side insert on purchases" ON public.purchase_history;
CREATE POLICY "Block client-side insert on purchases"
ON public.purchase_history FOR INSERT
TO authenticated
WITH CHECK (false);

-- =====================================================================
-- FIM DA MIGRAÇÃO 00012
-- =====================================================================
