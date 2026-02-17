import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from 'react-native-dotenv';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  RegisterScreen: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  Main: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { colors, theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha email e senha.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erro no login', error.message);
    }
    setLoading(false);
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new Error('Could not get ID token from Google Sign-In');
      }

      setLoading(true);
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;

    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        console.error(error);
        Alert.alert('Erro no login com Google', 'Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { position: 'absolute', top: 60, left: 20, right: 20, zIndex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
    logo: { fontSize: 56, fontWeight: '900', color: colors.primary, textAlign: 'center', marginBottom: 8, fontStyle: 'italic', letterSpacing: -2 },
    title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 13, color: colors.secondaryText, textAlign: 'center', marginBottom: 36, letterSpacing: 1, lineHeight: 20 },
    forgotPassword: { color: colors.secondaryText, textAlign: 'right', marginVertical: 8, fontSize: 13, fontWeight: '500' },
    buttonContainer: { marginTop: 8 },
    socialSection: { marginTop: 24, marginBottom: 10, width: '100%' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { marginHorizontal: 16, fontSize: 13, fontWeight: '500', color: colors.secondaryText },
    socialButtonsContainer: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
    socialBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1,
      paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.card,
      shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    socialBtnText: { marginLeft: 10, fontSize: 15, fontWeight: '600', color: colors.text },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, marginLeft: -10 }}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
          <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.logo}>elo</Text>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Ache seu caminho.{'\n'}Encontre seu propósito.</Text>

        <StyledInput icon="person-outline" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <StyledInput icon="lock-closed-outline" placeholder="Senha" isPassword={true} value={password} onChangeText={setPassword} />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <StyledButton title={loading ? 'Entrando...' : 'Entrar'} onPress={handleLogin} disabled={loading} />
          <StyledButton title="Criar Conta" type="outline" onPress={() => navigation.navigate('RegisterScreen')} />
        </View>

        <View style={styles.socialSection}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialBtn} onPress={onGoogleButtonPress} disabled={loading}>
              <Icon name="google" size={22} color="#DB4437" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
