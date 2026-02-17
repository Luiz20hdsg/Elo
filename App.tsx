import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Session } from '@supabase/supabase-js';

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

import { ThemeProvider } from './src/contexts/ThemeContext';
import { supabase } from './src/lib/supabase';
import { notificationService } from './src/lib/notificationService';

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
  </Stack.Navigator>
);

// O App agora gerencia o estado da sessão e decide qual navegador mostrar.
function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize OneSignal
    notificationService.init();
  }, []);

  useEffect(() => {
    // Busca a sessão ativa quando o app inicia
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // If there's a session on startup, register the device
        notificationService.getAndSaveDeviceToken();
      }
      setLoading(false);
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
          {session && session.user ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
