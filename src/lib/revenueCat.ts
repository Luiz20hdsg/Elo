// =====================================================================
// RevenueCat – Unified In-App Purchase layer
// Handles Apple IAP, Google Play Billing, and subscription state sync.
// =====================================================================

import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesEntitlementInfo,
  PRODUCT_CATEGORY,
} from 'react-native-purchases';
import {
  REVENUECAT_APPLE_KEY,
  REVENUECAT_GOOGLE_KEY,
} from 'react-native-dotenv';
import { supabase } from './supabase';

// =====================================================================
// Constants – must match RevenueCat Dashboard entitlements & product IDs
// =====================================================================

/** Entitlement identifiers (configured in RevenueCat dashboard) */
export const ENTITLEMENTS = {
  LIGHT: 'light',
  PREMIUM_PLUS: 'premium_plus',
} as const;

/** Product identifiers for consumables (configured in stores + RevenueCat) */
export const CONSUMABLE_PRODUCTS = {
  SUPER_LIKES_5: 'elo_super_likes_5',
  SUPER_LIKES_15: 'elo_super_likes_15',
  BOOSTS_1: 'elo_boost_1',
  BOOSTS_5: 'elo_boosts_5',
  REWINDS_5: 'elo_rewinds_5',
} as const;

// =====================================================================
// Types
// =====================================================================

export type RevenueCatPlan = 'free' | 'light' | 'premium_plus';

export interface PlanOffering {
  identifier: string;
  plan: RevenueCatPlan;
  title: string;
  monthlyPackage: PurchasesPackage | null;
  annualPackage: PurchasesPackage | null;
  monthlyPrice: string;
  annualPrice: string;
  annualMonthlyPrice: string;
  savingsPercent: number;
}

export interface RevenueCatState {
  isConfigured: boolean;
  customerInfo: CustomerInfo | null;
  currentPlan: RevenueCatPlan;
  offerings: PlanOffering[];
  isLoading: boolean;
  error: string | null;
}

// =====================================================================
// Initialization
// =====================================================================

let _isConfigured = false;

/**
 * Configure RevenueCat SDK. Called from App.tsx on boot.
 * This function is safe to call multiple times – it will skip if already configured.
 * @param supabaseUserId – The Supabase auth user ID to link with RevenueCat.
 */
export async function configureRevenueCat(supabaseUserId?: string): Promise<void> {
  if (_isConfigured) return;

  const apiKey = Platform.OS === 'ios' ? REVENUECAT_APPLE_KEY : REVENUECAT_GOOGLE_KEY;

  if (!apiKey || apiKey.startsWith('YOUR_')) {
    console.warn('[RevenueCat] API key not configured – running in sandbox mode');
    return;
  }

  try {
    // SDK may already be configured from App.tsx boot – try to get customer info
    // If it works, mark as configured without re-calling configure()
    try {
      await Purchases.getCustomerInfo();
      _isConfigured = true;
      console.log('[RevenueCat] Already configured (from App.tsx boot)');
      return;
    } catch {
      // Not yet configured, proceed below
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);

    Purchases.configure({
      apiKey,
      appUserID: supabaseUserId ?? null,
    });

    _isConfigured = true;
    console.log('[RevenueCat] Configured successfully');
  } catch (err) {
    console.error('[RevenueCat] Configuration error:', err);
  }
}

/**
 * Login / identify user after Supabase auth.
 */
export async function loginRevenueCat(supabaseUserId: string): Promise<CustomerInfo | null> {
  if (!_isConfigured) {
    await configureRevenueCat(supabaseUserId);
  }

  if (!_isConfigured) return null;

  try {
    const { customerInfo } = await Purchases.logIn(supabaseUserId);
    return customerInfo;
  } catch (err) {
    console.error('[RevenueCat] Login error:', err);
    return null;
  }
}

/**
 * Logout / reset user on Supabase sign-out.
 */
export async function logoutRevenueCat(): Promise<void> {
  if (!_isConfigured) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    console.error('[RevenueCat] Logout error:', err);
  }
}

// =====================================================================
// Subscription State
// =====================================================================

/**
 * Get the current customer info from RevenueCat.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!_isConfigured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (err) {
    console.error('[RevenueCat] getCustomerInfo error:', err);
    return null;
  }
}

/**
 * Determine the user's plan based on active entitlements.
 */
export function getPlanFromCustomerInfo(info: CustomerInfo | null): RevenueCatPlan {
  if (!info) return 'free';

  const entitlements = info.entitlements.active;

  if (entitlements[ENTITLEMENTS.PREMIUM_PLUS]?.isActive) {
    return 'premium_plus';
  }
  if (entitlements[ENTITLEMENTS.LIGHT]?.isActive) {
    return 'light';
  }
  return 'free';
}

/**
 * Get entitlement details (expiration, billing issue, etc.)
 */
export function getEntitlementDetails(
  info: CustomerInfo | null,
  plan: RevenueCatPlan,
): PurchasesEntitlementInfo | null {
  if (!info || plan === 'free') return null;
  const entitlementId = plan === 'premium_plus' ? ENTITLEMENTS.PREMIUM_PLUS : ENTITLEMENTS.LIGHT;
  return info.entitlements.active[entitlementId] ?? null;
}

// =====================================================================
// Offerings (available packages to purchase)
// =====================================================================

/**
 * Fetch available offerings from RevenueCat (reads from store config).
 */
export async function getOfferings(): Promise<PlanOffering[]> {
  if (!_isConfigured) return [];

  try {
    const offerings = await Purchases.getOfferings();
    const result: PlanOffering[] = [];

    // Light offering
    const lightOffering = offerings.all['light'] ?? offerings.all['elo_light'];
    if (lightOffering) {
      const monthly = lightOffering.monthly;
      const annual = lightOffering.annual;
      const monthlyPrice = monthly?.product.priceString ?? 'R$ 19,90';
      const annualPrice = annual?.product.priceString ?? 'R$ 149,90';
      const annualMonthly = annual
        ? `${annual.product.currencyCode} ${(annual.product.price / 12).toFixed(2)}`
        : 'R$ 12,49';
      const savings = annual && monthly
        ? Math.round((1 - (annual.product.price / 12) / monthly.product.price) * 100)
        : 37;

      result.push({
        identifier: 'light',
        plan: 'light',
        title: 'Light',
        monthlyPackage: monthly ?? null,
        annualPackage: annual ?? null,
        monthlyPrice,
        annualPrice,
        annualMonthlyPrice: annualMonthly,
        savingsPercent: savings,
      });
    }

    // Premium+ offering
    const premiumOffering = offerings.all['premium_plus'] ?? offerings.all['elo_premium_plus'];
    if (premiumOffering) {
      const monthly = premiumOffering.monthly;
      const annual = premiumOffering.annual;
      const monthlyPrice = monthly?.product.priceString ?? 'R$ 39,90';
      const annualPrice = annual?.product.priceString ?? 'R$ 299,90';
      const annualMonthly = annual
        ? `${annual.product.currencyCode} ${(annual.product.price / 12).toFixed(2)}`
        : 'R$ 24,99';
      const savings = annual && monthly
        ? Math.round((1 - (annual.product.price / 12) / monthly.product.price) * 100)
        : 37;

      result.push({
        identifier: 'premium_plus',
        plan: 'premium_plus',
        title: 'Premium+',
        monthlyPackage: monthly ?? null,
        annualPackage: annual ?? null,
        monthlyPrice,
        annualPrice,
        annualMonthlyPrice: annualMonthly,
        savingsPercent: savings,
      });
    }

    return result;
  } catch (err) {
    console.error('[RevenueCat] getOfferings error:', err);
    return [];
  }
}

// =====================================================================
// Purchase Actions
// =====================================================================

export interface PurchaseResult {
  success: boolean;
  plan: RevenueCatPlan;
  customerInfo: CustomerInfo | null;
  error?: string;
  userCancelled?: boolean;
}

/**
 * Purchase a subscription package.
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!_isConfigured) {
    return { success: false, plan: 'free', customerInfo: null, error: 'RevenueCat not configured' };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const plan = getPlanFromCustomerInfo(customerInfo);

    // Sync to Supabase
    await syncSubscriptionToSupabase(customerInfo, plan);

    return { success: true, plan, customerInfo };
  } catch (err: any) {
    if (err.userCancelled) {
      return { success: false, plan: 'free', customerInfo: null, userCancelled: true };
    }
    console.error('[RevenueCat] Purchase error:', err);
    return {
      success: false,
      plan: 'free',
      customerInfo: null,
      error: err.message ?? 'Purchase failed',
    };
  }
}

/**
 * Restore previous purchases (e.g., after reinstall).
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!_isConfigured) {
    return { success: false, plan: 'free', customerInfo: null, error: 'RevenueCat not configured' };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const plan = getPlanFromCustomerInfo(customerInfo);

    // Sync to Supabase
    await syncSubscriptionToSupabase(customerInfo, plan);

    return { success: true, plan, customerInfo };
  } catch (err: any) {
    console.error('[RevenueCat] Restore error:', err);
    return {
      success: false,
      plan: 'free',
      customerInfo: null,
      error: err.message ?? 'Restore failed',
    };
  }
}

// =====================================================================
// Supabase Sync
// =====================================================================

/**
 * Sync subscription state from RevenueCat to our Supabase DB.
 * Called after purchase/restore. Also called from webhook as a backup.
 */
async function syncSubscriptionToSupabase(
  customerInfo: CustomerInfo,
  plan: RevenueCatPlan,
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const provider = Platform.OS === 'ios' ? 'apple' : 'google';

    let status: string = 'active';
    let periodStart: string | null = null;
    let periodEnd: string | null = null;
    let providerSubId: string | null = null;

    if (plan !== 'free') {
      const entitlementId = plan === 'premium_plus' ? ENTITLEMENTS.PREMIUM_PLUS : ENTITLEMENTS.LIGHT;
      const entitlement = customerInfo.entitlements.active[entitlementId];

      if (entitlement) {
        periodEnd = entitlement.expirationDate;
        periodStart = entitlement.latestPurchaseDate;
        providerSubId = entitlement.productIdentifier;

        if (entitlement.willRenew === false) {
          status = 'cancelled'; // Still active but won't renew
        }
      }
    }

    // Use the Supabase RPC function we already have
    const { error } = await supabase.rpc('update_subscription', {
      p_user_id: user.id,
      p_plan: plan,
      p_status: status,
      p_provider: provider,
      p_provider_subscription_id: providerSubId ?? '',
      p_period_start: periodStart ?? new Date().toISOString(),
      p_period_end: periodEnd ?? null,
    });

    if (error) {
      console.error('[RevenueCat] Supabase sync error:', error);
    } else {
      console.log('[RevenueCat] Synced to Supabase:', plan, status);
    }
  } catch (err) {
    console.error('[RevenueCat] syncSubscriptionToSupabase error:', err);
  }
}

// =====================================================================
// Listener – real-time subscription changes
// =====================================================================

/**
 * Register a listener for customer info changes.
 * This fires when subscriptions are renewed, cancelled, etc.
 */
export function addCustomerInfoListener(
  callback: (info: CustomerInfo) => void,
): () => void {
  if (!_isConfigured) return () => {};

  Purchases.addCustomerInfoUpdateListener(callback);

  // Return unsubscribe function
  return () => {
    Purchases.removeCustomerInfoUpdateListener(callback);
  };
}

// =====================================================================
// Consumable Purchases
// =====================================================================

/**
 * Purchase a consumable product (super likes, boosts, etc.).
 */
export async function purchaseConsumable(productId: string): Promise<PurchaseResult> {
  if (!_isConfigured) {
    return { success: false, plan: 'free', customerInfo: null, error: 'RevenueCat not configured' };
  }

  try {
    const products = await Purchases.getProducts([productId], PRODUCT_CATEGORY.NON_SUBSCRIPTION);
    if (!products || products.length === 0) {
      return { success: false, plan: 'free', customerInfo: null, error: 'Product not found' };
    }

    const { customerInfo } = await Purchases.purchaseStoreProduct(products[0]);

    // Credit consumables in Supabase based on product
    await creditConsumable(productId);

    const plan = getPlanFromCustomerInfo(customerInfo);
    return { success: true, plan, customerInfo };
  } catch (err: any) {
    if (err.userCancelled) {
      return { success: false, plan: 'free', customerInfo: null, userCancelled: true };
    }
    console.error('[RevenueCat] Consumable purchase error:', err);
    return {
      success: false,
      plan: 'free',
      customerInfo: null,
      error: err.message ?? 'Purchase failed',
    };
  }
}

/**
 * Credit consumable items to user's Supabase balance after purchase.
 */
async function creditConsumable(productId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  let superLikes = 0;
  let boosts = 0;
  let rewinds = 0;

  switch (productId) {
    case CONSUMABLE_PRODUCTS.SUPER_LIKES_5:
      superLikes = 5;
      break;
    case CONSUMABLE_PRODUCTS.SUPER_LIKES_15:
      superLikes = 15;
      break;
    case CONSUMABLE_PRODUCTS.BOOSTS_1:
      boosts = 1;
      break;
    case CONSUMABLE_PRODUCTS.BOOSTS_5:
      boosts = 5;
      break;
    case CONSUMABLE_PRODUCTS.REWINDS_5:
      rewinds = 5;
      break;
  }

  if (superLikes > 0 || boosts > 0 || rewinds > 0) {
    const { error } = await supabase.rpc('add_consumables', {
      p_user_id: user.id,
      p_super_likes: superLikes,
      p_boosts: boosts,
      p_rewinds: rewinds,
    });

    if (error) {
      console.error('[RevenueCat] creditConsumable error:', error);
    }
  }
}

// =====================================================================
// Utilities
// =====================================================================

/**
 * Check if RevenueCat is properly configured.
 */
export function isRevenueCatConfigured(): boolean {
  return _isConfigured;
}

/**
 * Manage subscription (opens store management page).
 */
export async function openManageSubscriptions(): Promise<void> {
  if (!_isConfigured) return;
  try {
    // On iOS this opens the App Store subscriptions page
    // On Android this opens Google Play subscriptions
    if (Platform.OS === 'ios') {
      await Purchases.showManageSubscriptions();
    } else {
      await Purchases.showManageSubscriptions();
    }
  } catch (err) {
    console.error('[RevenueCat] openManageSubscriptions error:', err);
  }
}
