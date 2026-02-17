import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import {
  configureRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
  getCustomerInfo,
  getPlanFromCustomerInfo,
  addCustomerInfoListener,
  isRevenueCatConfigured,
} from '../lib/revenueCat';
import type { CustomerInfo } from 'react-native-purchases';

// ============================================================
// Types
// ============================================================

export type PlanType = 'free' | 'light' | 'premium_plus';
export type PlanStatus = 'active' | 'expired' | 'cancelled' | 'trial' | 'grace_period';

export interface SubscriptionState {
  plan: PlanType;
  status: PlanStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  // Limites do plano
  dailyLikeLimit: number;       // -1 = ilimitado
  dailySuperLikeLimit: number;
  dailyRewindLimit: number;
  canSeeWhoLiked: boolean;
  canUseAdvancedFilters: boolean;
  canBoost: boolean;
  canGoIncognito: boolean;
  hasReadReceipts: boolean;
  isAdFree: boolean;
  feedBoostMultiplier: number;
  // Uso de hoje
  likesUsedToday: number;
  superLikesUsedToday: number;
  rewindsUsedToday: number;
  boostsUsedToday: number;
  // Consumíveis comprados
  consumableSuperLikes: number;
  consumableBoosts: number;
  consumableRewinds: number;
  // Contagem de quem curtiu
  pendingLikesCount: number;
  // Estado de loading
  loading: boolean;
}

export interface SubscriptionContextType extends SubscriptionState {
  // Ações
  refreshPlan: () => Promise<void>;
  useDailyAction: (actionType: 'like' | 'super_like' | 'rewind' | 'boost') => Promise<{
    allowed: boolean;
    remaining: number;
  }>;
  // Helpers de permissão
  canLike: () => boolean;
  canSuperLike: () => boolean;
  canRewind: () => boolean;
  getRemainingLikes: () => number;
  getRemainingSuperLikes: () => number;
  isPremiumPlus: () => boolean;
  isLight: () => boolean;
  isFree: () => boolean;
  isPaid: () => boolean;
}

// ============================================================
// Defaults
// ============================================================

const defaultState: SubscriptionState = {
  plan: 'free',
  status: 'active',
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  dailyLikeLimit: 10,
  dailySuperLikeLimit: 1,
  dailyRewindLimit: 0,
  canSeeWhoLiked: false,
  canUseAdvancedFilters: false,
  canBoost: false,
  canGoIncognito: false,
  hasReadReceipts: false,
  isAdFree: false,
  feedBoostMultiplier: 1.0,
  likesUsedToday: 0,
  superLikesUsedToday: 0,
  rewindsUsedToday: 0,
  boostsUsedToday: 0,
  consumableSuperLikes: 0,
  consumableBoosts: 0,
  consumableRewinds: 0,
  pendingLikesCount: 0,
  loading: true,
};

// ============================================================
// Context
// ============================================================

const SubscriptionContext = createContext<SubscriptionContextType>({
  ...defaultState,
  refreshPlan: async () => {},
  useDailyAction: async () => ({ allowed: false, remaining: 0 }),
  canLike: () => false,
  canSuperLike: () => false,
  canRewind: () => false,
  getRemainingLikes: () => 0,
  getRemainingSuperLikes: () => 0,
  isPremiumPlus: () => false,
  isLight: () => false,
  isFree: () => true,
  isPaid: () => false,
});

export const useSubscription = () => useContext(SubscriptionContext);

// ============================================================
// Provider
// ============================================================

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SubscriptionState>(defaultState);
  const { t } = useTranslation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listenerCleanupRef = useRef<(() => void) | null>(null);

  // Buscar plano do banco (com sync opcional do RevenueCat)
  const refreshPlan = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({ ...defaultState, loading: false });
        return;
      }

      // Se RevenueCat está configurado, verificar estado lá também
      if (isRevenueCatConfigured()) {
        const customerInfo = await getCustomerInfo();
        if (customerInfo) {
          const rcPlan = getPlanFromCustomerInfo(customerInfo);
          // RevenueCat é a fonte da verdade para o plano
          // O Supabase DB é atualizado via webhook + sync local
          console.log('[Sub] RevenueCat plan:', rcPlan);
        }
      }

      const { data, error } = await supabase.rpc('get_user_plan', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching plan:', error);
        setState({ ...defaultState, loading: false });
        return;
      }

      if (data && data.length > 0) {
        const row = data[0];
        setState({
          plan: row.plan as PlanType,
          status: row.status as PlanStatus,
          currentPeriodEnd: row.current_period_end,
          cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
          dailyLikeLimit: row.daily_like_limit,
          dailySuperLikeLimit: row.daily_super_like_limit,
          dailyRewindLimit: row.daily_rewind_limit,
          canSeeWhoLiked: row.can_see_who_liked,
          canUseAdvancedFilters: row.can_use_advanced_filters,
          canBoost: row.can_boost,
          canGoIncognito: row.can_go_incognito,
          hasReadReceipts: row.has_read_receipts,
          isAdFree: row.is_ad_free,
          feedBoostMultiplier: row.feed_boost_multiplier,
          likesUsedToday: row.likes_used_today,
          superLikesUsedToday: row.super_likes_used_today,
          rewindsUsedToday: row.rewinds_used_today,
          boostsUsedToday: row.boosts_used_today,
          consumableSuperLikes: row.consumable_super_likes,
          consumableBoosts: row.consumable_boosts,
          consumableRewinds: row.consumable_rewinds,
          pendingLikesCount: row.pending_likes_count,
          loading: false,
        });
      } else {
        setState({ ...defaultState, loading: false });
      }
    } catch (err) {
      console.error('Error in refreshPlan:', err);
      setState({ ...defaultState, loading: false });
    }
  }, []);

  // Usar uma ação diária (retorna se foi permitida)
  const useDailyAction = useCallback(async (actionType: 'like' | 'super_like' | 'rewind' | 'boost') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { allowed: false, remaining: 0 };

      const { data, error } = await supabase.rpc('use_daily_action', {
        p_user_id: user.id,
        p_action_type: actionType,
      });

      if (error) {
        console.error('Error using daily action:', error);
        return { allowed: false, remaining: 0 };
      }

      if (data && data.length > 0) {
        const result = data[0];
        
        // Atualizar estado local imediatamente
        if (result.allowed) {
          setState(prev => {
            const updates: Partial<SubscriptionState> = {};
            if (actionType === 'like') updates.likesUsedToday = prev.likesUsedToday + 1;
            if (actionType === 'super_like') updates.superLikesUsedToday = prev.superLikesUsedToday + 1;
            if (actionType === 'rewind') updates.rewindsUsedToday = prev.rewindsUsedToday + 1;
            if (actionType === 'boost') updates.boostsUsedToday = prev.boostsUsedToday + 1;
            return { ...prev, ...updates };
          });
        }

        return {
          allowed: result.allowed,
          remaining: result.remaining,
        };
      }

      return { allowed: false, remaining: 0 };
    } catch (err) {
      console.error('Error in useDailyAction:', err);
      return { allowed: false, remaining: 0 };
    }
  }, []);

  // Helpers de permissão
  const canLike = useCallback(() => {
    if (state.dailyLikeLimit === -1) return true;
    return state.likesUsedToday < state.dailyLikeLimit;
  }, [state.dailyLikeLimit, state.likesUsedToday]);

  const canSuperLike = useCallback(() => {
    if (state.dailySuperLikeLimit === -1) return true;
    if (state.superLikesUsedToday < state.dailySuperLikeLimit) return true;
    if (state.consumableSuperLikes > 0) return true;
    return false;
  }, [state.dailySuperLikeLimit, state.superLikesUsedToday, state.consumableSuperLikes]);

  const canRewind = useCallback(() => {
    if (state.dailyRewindLimit === -1) return true;
    if (state.dailyRewindLimit === 0 && state.consumableRewinds === 0) return false;
    if (state.rewindsUsedToday < state.dailyRewindLimit) return true;
    if (state.consumableRewinds > 0) return true;
    return false;
  }, [state.dailyRewindLimit, state.rewindsUsedToday, state.consumableRewinds]);

  const getRemainingLikes = useCallback(() => {
    if (state.dailyLikeLimit === -1) return -1;
    return Math.max(0, state.dailyLikeLimit - state.likesUsedToday);
  }, [state.dailyLikeLimit, state.likesUsedToday]);

  const getRemainingSuperLikes = useCallback(() => {
    if (state.dailySuperLikeLimit === -1) return -1;
    const fromPlan = Math.max(0, state.dailySuperLikeLimit - state.superLikesUsedToday);
    return fromPlan + state.consumableSuperLikes;
  }, [state.dailySuperLikeLimit, state.superLikesUsedToday, state.consumableSuperLikes]);

  const isPremiumPlus = useCallback(() => state.plan === 'premium_plus', [state.plan]);
  const isLight = useCallback(() => state.plan === 'light', [state.plan]);
  const isFree = useCallback(() => state.plan === 'free', [state.plan]);
  const isPaid = useCallback(() => state.plan !== 'free', [state.plan]);

  // Carregar plano no mount e a cada 5 minutos
  useEffect(() => {
    const init = async () => {
      // Configurar RevenueCat se ainda não estiver
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await configureRevenueCat(user.id);
        await loginRevenueCat(user.id);

        // Escutar mudanças em tempo real do RevenueCat
        listenerCleanupRef.current = addCustomerInfoListener((info: CustomerInfo) => {
          const rcPlan = getPlanFromCustomerInfo(info);
          console.log('[Sub] RevenueCat listener - plan changed:', rcPlan);
          refreshPlan(); // Re-sync from Supabase DB
        });
      }

      refreshPlan();
    };

    init();
    intervalRef.current = setInterval(refreshPlan, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (listenerCleanupRef.current) listenerCleanupRef.current();
    };
  }, [refreshPlan]);

  // Escutar mudanças de auth (login/logout)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await configureRevenueCat(session.user.id);
        await loginRevenueCat(session.user.id);

        // Registrar listener do RevenueCat
        if (listenerCleanupRef.current) listenerCleanupRef.current();
        listenerCleanupRef.current = addCustomerInfoListener((info: CustomerInfo) => {
          const rcPlan = getPlanFromCustomerInfo(info);
          console.log('[Sub] RevenueCat listener - plan changed:', rcPlan);
          refreshPlan();
        });

        refreshPlan();
      } else if (event === 'SIGNED_OUT') {
        if (listenerCleanupRef.current) {
          listenerCleanupRef.current();
          listenerCleanupRef.current = null;
        }
        await logoutRevenueCat();
        setState({ ...defaultState, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshPlan]);

  const contextValue: SubscriptionContextType = {
    ...state,
    refreshPlan,
    useDailyAction,
    canLike,
    canSuperLike,
    canRewind,
    getRemainingLikes,
    getRemainingSuperLikes,
    isPremiumPlus,
    isLight,
    isFree,
    isPaid,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
