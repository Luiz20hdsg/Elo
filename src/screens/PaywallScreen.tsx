import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  isRevenueCatConfigured,
  type PlanOffering,
} from '../lib/revenueCat';
import type { PurchasesPackage } from 'react-native-purchases';

const { width } = Dimensions.get('window');

type PlanOption = 'light' | 'premium_plus';

const PaywallScreen = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { plan: currentPlan, refreshPlan } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>('premium_plus');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [rcOfferings, setRcOfferings] = useState<PlanOffering[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Carregar offerings do RevenueCat
  useEffect(() => {
    const load = async () => {
      if (isRevenueCatConfigured()) {
        const offers = await getOfferings();
        if (offers.length > 0) {
          setRcOfferings(offers);
        }
      }
    };
    load();
  }, []);

  // Preços dinâmicos (RevenueCat ou fallback)
  const getLightOffering = useCallback(() => rcOfferings.find(o => o.plan === 'light'), [rcOfferings]);
  const getPremiumOffering = useCallback(() => rcOfferings.find(o => o.plan === 'premium_plus'), [rcOfferings]);

  const plans = {
    light: {
      name: 'Light',
      icon: 'flash',
      color: '#4CAF50',
      monthlyPrice: getLightOffering()?.monthlyPrice ?? 'R$ 19,90',
      annualPrice: getLightOffering()?.annualPrice ?? 'R$ 149,90',
      annualMonthly: getLightOffering()?.annualMonthlyPrice ?? 'R$ 12,49',
      savingsPercent: getLightOffering()?.savingsPercent?.toString() ?? '37',
      features: [
        { text: t('paywall.unlimitedLikes'), icon: 'heart', included: true },
        { text: t('paywall.threeSuperLikes'), icon: 'star', included: true },
        { text: t('paywall.fiveRewinds'), icon: 'refresh', included: true },
        { text: t('paywall.weeklyBoost'), icon: 'rocket', included: true },
        { text: t('paywall.advancedFilters'), icon: 'options', included: true },
        { text: t('paywall.noAds'), icon: 'eye-off', included: true },
        { text: t('paywall.feedPriority'), icon: 'trending-up', included: true },
        { text: t('paywall.seeWhoLiked'), icon: 'people', included: false },
        { text: t('paywall.readReceipts'), icon: 'checkmark-done', included: false },
        { text: t('paywall.incognito'), icon: 'glasses', included: false },
      ],
    },
    premium_plus: {
      name: 'Premium+',
      icon: 'diamond',
      color: '#FFD700',
      monthlyPrice: getPremiumOffering()?.monthlyPrice ?? 'R$ 39,90',
      annualPrice: getPremiumOffering()?.annualPrice ?? 'R$ 299,90',
      annualMonthly: getPremiumOffering()?.annualMonthlyPrice ?? 'R$ 24,99',
      savingsPercent: getPremiumOffering()?.savingsPercent?.toString() ?? '37',
      features: [
        { text: t('paywall.unlimitedLikes'), icon: 'heart', included: true },
        { text: t('paywall.fiveSuperLikes'), icon: 'star', included: true },
        { text: t('paywall.unlimitedRewinds'), icon: 'refresh', included: true },
        { text: t('paywall.dailyBoost'), icon: 'rocket', included: true },
        { text: t('paywall.fullFilters'), icon: 'options', included: true },
        { text: t('paywall.noAds'), icon: 'eye-off', included: true },
        { text: t('paywall.maxFeedPriority'), icon: 'trending-up', included: true },
        { text: t('paywall.seeWhoLiked'), icon: 'people', included: true },
        { text: t('paywall.readReceipts'), icon: 'checkmark-done', included: true },
        { text: t('paywall.incognito'), icon: 'glasses', included: true },
      ],
    },
  };

  const selected = plans[selectedPlan];
  const price = billingCycle === 'annual' ? selected.annualPrice : selected.monthlyPrice;
  const perMonth = billingCycle === 'annual' ? selected.annualMonthly : selected.monthlyPrice;

  // Obter pacote correto do RevenueCat
  const getPackageForPurchase = useCallback((): PurchasesPackage | null => {
    const offering = selectedPlan === 'premium_plus' ? getPremiumOffering() : getLightOffering();
    if (!offering) return null;
    return billingCycle === 'annual' ? offering.annualPackage : offering.monthlyPackage;
  }, [selectedPlan, billingCycle, getPremiumOffering, getLightOffering]);

  const handlePurchase = async () => {
    const pkg = getPackageForPurchase();

    if (!pkg) {
      // RevenueCat não configurado ou sem offerings – modo de desenvolvimento
      Alert.alert(
        'Sandbox',
        `Plano: ${selectedPlan}\nCiclo: ${billingCycle}\n\nConfigure as chaves do RevenueCat no .env para ativar compras reais.`,
      );
      return;
    }

    setPurchasing(true);
    try {
      const result = await purchasePackage(pkg);

      if (result.success) {
        await refreshPlan();
        Alert.alert('✅', t('common.success'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else if (result.userCancelled) {
        // Usuário cancelou – não fazer nada
      } else {
        Alert.alert(t('common.error'), result.error ?? 'Purchase failed');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restorePurchases();
      if (result.success && result.plan !== 'free') {
        await refreshPlan();
        Alert.alert('✅', `${t('common.success')} – ${result.plan === 'premium_plus' ? 'Premium+' : 'Light'}`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else if (result.success) {
        Alert.alert('ℹ️', 'No active subscriptions found.');
      } else {
        Alert.alert(t('common.error'), result.error ?? 'Restore failed');
      }
    } finally {
      setRestoring(false);
    }
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12,
    },
    closeButton: { padding: 8 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
    placeholder: { width: 40 },
    scrollContent: { paddingBottom: 120 },

    // Hero section
    heroSection: {
      alignItems: 'center', paddingVertical: 30, paddingHorizontal: 24,
    },
    heroIconContainer: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: selected.color, justifyContent: 'center',
      alignItems: 'center', marginBottom: 16,
      shadowColor: selected.color, shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    heroTitle: {
      fontSize: 28, fontWeight: '900', color: colors.text,
      textAlign: 'center', marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 15, color: colors.secondaryText, textAlign: 'center',
      lineHeight: 22, paddingHorizontal: 10,
    },

    // Plan selector
    planSelectorContainer: {
      flexDirection: 'row', marginHorizontal: 24, marginTop: 24,
      backgroundColor: colors.card, borderRadius: 16, padding: 4,
      borderWidth: 1, borderColor: colors.separator,
    },
    planSelectorButton: {
      flex: 1, paddingVertical: 12, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
    },
    planSelectorActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
    },
    planSelectorText: {
      fontSize: 14, fontWeight: '700', color: colors.secondaryText,
    },
    planSelectorActiveText: { color: '#FFF' },

    // Billing toggle
    billingContainer: {
      flexDirection: 'row', marginHorizontal: 24, marginTop: 16,
      backgroundColor: colors.card, borderRadius: 16, padding: 4,
      borderWidth: 1, borderColor: colors.separator,
    },
    billingButton: {
      flex: 1, paddingVertical: 10, borderRadius: 12,
      alignItems: 'center',
    },
    billingActive: {
      backgroundColor: theme === 'dark' ? 'rgba(29,185,84,0.15)' : 'rgba(29,185,84,0.1)',
      borderWidth: 1.5, borderColor: colors.primary,
    },
    billingText: { fontSize: 13, fontWeight: '600', color: colors.secondaryText },
    billingActiveText: { color: colors.primary },
    savingsBadge: {
      backgroundColor: colors.primary, borderRadius: 8,
      paddingHorizontal: 6, paddingVertical: 2, marginTop: 4,
    },
    savingsText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

    // Features list
    featuresSection: {
      marginHorizontal: 24, marginTop: 24,
    },
    featuresSectionTitle: {
      fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 16,
    },
    featureRow: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: colors.separator,
    },
    featureIconContainer: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: theme === 'dark' ? 'rgba(29,185,84,0.12)' : 'rgba(29,185,84,0.08)',
      justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    featureText: {
      flex: 1, fontSize: 14, fontWeight: '500',
    },
    featureIncluded: { color: colors.text },
    featureExcluded: { color: colors.secondaryText, textDecorationLine: 'line-through' },

    // Price section
    priceSection: {
      alignItems: 'center', marginTop: 28, marginHorizontal: 24,
      backgroundColor: colors.card, borderRadius: 20, padding: 24,
      borderWidth: 1, borderColor: colors.separator,
    },
    priceAmount: { fontSize: 36, fontWeight: '900', color: colors.text },
    pricePerMonth: { fontSize: 14, color: colors.secondaryText, marginTop: 4 },
    priceNote: {
      fontSize: 12, color: colors.secondaryText, marginTop: 8, textAlign: 'center',
    },

    // CTA Button
    ctaContainer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingHorizontal: 24, paddingBottom: 34, paddingTop: 16,
      backgroundColor: colors.background,
      borderTopWidth: 1, borderTopColor: colors.separator,
    },
    ctaButton: {
      backgroundColor: colors.primary, paddingVertical: 16,
      borderRadius: 28, alignItems: 'center',
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    },
    ctaText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
    ctaSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
    restoreText: {
      textAlign: 'center', marginTop: 10, color: colors.secondaryText,
      fontSize: 13, fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('paywall.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Ionicons name={selected.icon as any} size={36} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>
            Elo {selected.name}
          </Text>
          <Text style={styles.heroSubtitle}>
            {selectedPlan === 'premium_plus'
              ? t('paywall.premiumPlusDesc')
              : t('paywall.lightDesc')
            }
          </Text>
        </View>

        {/* Plan Selector */}
        <View style={styles.planSelectorContainer}>
          <TouchableOpacity
            style={[styles.planSelectorButton, selectedPlan === 'light' && styles.planSelectorActive]}
            onPress={() => setSelectedPlan('light')}
          >
            <Text style={[styles.planSelectorText, selectedPlan === 'light' && styles.planSelectorActiveText]}>
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.planSelectorButton, selectedPlan === 'premium_plus' && styles.planSelectorActive]}
            onPress={() => setSelectedPlan('premium_plus')}
          >
            <Text style={[styles.planSelectorText, selectedPlan === 'premium_plus' && styles.planSelectorActiveText]}>
              Premium+
            </Text>
          </TouchableOpacity>
        </View>

        {/* Billing Toggle */}
        <View style={styles.billingContainer}>
          <TouchableOpacity
            style={[styles.billingButton, billingCycle === 'monthly' && styles.billingActive]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text style={[styles.billingText, billingCycle === 'monthly' && styles.billingActiveText]}>
              {t('paywall.monthly')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.billingButton, billingCycle === 'annual' && styles.billingActive]}
            onPress={() => setBillingCycle('annual')}
          >
            <Text style={[styles.billingText, billingCycle === 'annual' && styles.billingActiveText]}>
              {t('paywall.annual')}
            </Text>
            {billingCycle === 'annual' && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>-{selected.savingsPercent}%</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>{t('paywall.whatsIncluded')}</Text>
          {selected.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Ionicons
                  name={feature.icon as any}
                  size={18}
                  color={feature.included ? colors.primary : colors.secondaryText}
                />
              </View>
              <Text style={[
                styles.featureText,
                feature.included ? styles.featureIncluded : styles.featureExcluded,
              ]}>
                {feature.text}
              </Text>
              <Ionicons
                name={feature.included ? 'checkmark-circle' : 'close-circle'}
                size={22}
                color={feature.included ? colors.primary : '#888'}
              />
            </View>
          ))}
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.priceAmount}>{price}</Text>
          {billingCycle === 'annual' && (
            <Text style={styles.pricePerMonth}>
              {perMonth}/{t('paywall.perMonth')}
            </Text>
          )}
          <Text style={styles.priceNote}>
            {billingCycle === 'annual'
              ? t('paywall.billedAnnually')
              : t('paywall.billedMonthly')
            }
          </Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.ctaButton, purchasing && { opacity: 0.7 }]}
          onPress={handlePurchase}
          disabled={purchasing || restoring}
        >
          {purchasing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.ctaText}>{t('paywall.subscribe')}</Text>
              <Text style={styles.ctaSubtext}>{t('paywall.cancelAnytime')}</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore} disabled={purchasing || restoring}>
          {restoring ? (
            <ActivityIndicator color={colors.secondaryText} size="small" style={{ marginTop: 12 }} />
          ) : (
            <Text style={styles.restoreText}>{t('paywall.restorePurchases')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaywallScreen;
