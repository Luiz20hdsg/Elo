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

import { ThemeProvider } from './src/contexts/ThemeContext';
import { supabase } from './src/lib/supabase';

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

// O App agora gerencia o estado da sessão e decide qual navegador mostrar.
function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão ativa quando o app inicia
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Ouve mudanças no estado de autenticação (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
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
          {/* Se existe uma sessão, mostra o TabNavigator, senão, o AuthNavigator */}
          {session && session.user ? <TabNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
