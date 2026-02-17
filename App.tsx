import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Session } from '@supabase/supabase-js';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

import LoginScreen from './src/screens/LoginScreen';
import InitialScreen from './src/screens/InitialScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TabNavigator from './src/navigation/TabNavigator';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import PhotoTipsScreen from './src/screens/PhotoTipsScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import PaywallScreen from './src/screens/PaywallScreen';

import { ThemeProvider } from './src/contexts/ThemeContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { supabase } from './src/lib/supabase';
import { notificationService } from './src/lib/notificationService';
import { BYPASS_EMAIL, BYPASS_PASSWORD, REVENUECAT_APPLE_KEY, REVENUECAT_GOOGLE_KEY } from 'react-native-dotenv';
import './src/i18n'; // Initialize i18n

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

// Navegador para as telas de autenticação
const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Initial">
    <Stack.Screen
      name="Initial"
      component={InitialScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="RegisterScreen"
      component={RegisterScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Navegador principal (autenticado) - Tab + telas modais/detalhes
const MainNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Tabs"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ChatDetail"
      component={ChatDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EditProfileScreen"
      component={EditProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PhotoTips"
      component={PhotoTipsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SummaryScreen"
      component={SummaryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Paywall"
      component={PaywallScreen}
      options={{ headerShown: false, presentation: 'modal' }}
    />
  </Stack.Navigator>
);

// O App agora gerencia o estado da sessão e decide qual navegador mostrar.
function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize OneSignal
    notificationService.init();

    // Initialize RevenueCat SDK (as early as possible)
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);

    const apiKey = Platform.OS === 'ios' ? REVENUECAT_APPLE_KEY : REVENUECAT_GOOGLE_KEY;
    if (apiKey && !apiKey.startsWith('YOUR_')) {
      Purchases.configure({ apiKey });
      console.log('[RevenueCat] Configured in App.tsx');
    }
  }, []);

  useEffect(() => {
    // Busca a sessão ativa quando o app inicia
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (existingSession) {
        setSession(existingSession);
        notificationService.getAndSaveDeviceToken();
        setLoading(false);
      } else if (__DEV__ && BYPASS_EMAIL && BYPASS_PASSWORD) {
        // Dev bypass: auto-login with .env credentials
        console.log('[DEV] Bypass login with', BYPASS_EMAIL);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: BYPASS_EMAIL,
          password: BYPASS_PASSWORD,
        });
        if (error) {
          console.warn('[DEV] Bypass login failed:', error.message);
        }
        if (data?.session) {
          setSession(data.session);
          notificationService.getAndSaveDeviceToken();
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // Ouve mudanças no estado de autenticação (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (event === 'SIGNED_IN') {
          notificationService.getAndSaveDeviceToken();
        }
        if (event === 'SIGNED_OUT') {
          notificationService.removeDeviceTokenOnLogout();
        }
        setLoading(false);
      }
    );

    // Limpa o listener ao desmontar o componente
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Enquanto verifica a sessão, pode-se mostrar um splash screen
  if (loading) {
    return null; // Ou um componente de loading
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <NavigationContainer>
          {/* Se existe uma sessão, mostra o MainNavigator, senão, o AuthNavigator */}
          {session && session.user ? (
            <SubscriptionProvider>
              <MainNavigator />
            </SubscriptionProvider>
          ) : (
            <AuthNavigator />
          )}
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
