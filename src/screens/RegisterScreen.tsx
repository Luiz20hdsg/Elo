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
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import { GOOGLE_WEB_CLIENT_ID } from 'react-native-dotenv';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { colors, theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !username || !birthDate) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    const dateParts = birthDate.split('/');
    if (dateParts.length !== 3 || dateParts[2].length !== 4 || dateParts[1].length !== 2 || dateParts[0].length !== 2) {
      Alert.alert('Data inválida', 'Por favor, use o formato DD/MM/AAAA para a data de nascimento.');
      return;
    }
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    setLoading(true);
    const { data: { user }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erro no cadastro', error.message);
      setLoading(false);
      return;
    }

    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username: username,
          birth_date: formattedDate,
        })
        .eq('id', user.id);

      if (profileError) {
        Alert.alert('Erro ao criar perfil', profileError.message);
      } else {
        Alert.alert(
          'Cadastro realizado!',
          'Um email de confirmação foi enviado. Por favor, verifique sua caixa de entrada.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    }
    setLoading(false);
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error('Could not get ID token');
      setLoading(true);
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      if (error) throw error;
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        console.error(error);
        Alert.alert('Erro no cadastro com Google', 'Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onAppleButtonPress = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const { identityToken } = appleAuthRequestResponse;
      if (!identityToken) throw new Error('Could not get ID token');
      setLoading(true);
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken });
      if (error) throw error;
    } catch (error: any) {
      if (error.code !== appleAuth.Error.CANCELED) {
        console.error(error);
        Alert.alert('Erro no login com Apple', 'Ocorreu um erro inesperado.');
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
    subtitle: { fontSize: 13, color: colors.secondaryText, textAlign: 'center', marginBottom: 28, letterSpacing: 1 },
    buttonContainer: { marginTop: 16 },
    socialSection: { marginTop: 20, width: '100%' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { marginHorizontal: 16, fontSize: 13, fontWeight: '500', color: colors.secondaryText },
    socialButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
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
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ padding: 10, marginLeft: -10 }}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
          <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.logo}>elo</Text>
        <Text style={styles.subtitle}>Crie sua conta.</Text>
        <Text style={styles.title}>Cadastro</Text>

        <StyledInput icon="person-outline" placeholder="Nome de usuário" autoCapitalize="none" value={username} onChangeText={setUsername} />
        <StyledInput icon="mail-outline" placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <StyledInput icon="calendar-outline" placeholder="Data de nascimento (DD/MM/AAAA)" autoCapitalize="none" value={birthDate} onChangeText={setBirthDate} maxLength={10} keyboardType="numeric" />
        <StyledInput icon="lock-closed-outline" placeholder="Senha" isPassword={true} value={password} onChangeText={setPassword} />

        <View style={styles.buttonContainer}>
          <StyledButton title={loading ? 'Cadastrando...' : 'Cadastrar'} onPress={handleSignUp} disabled={loading} />
        </View>

        <View style={styles.socialSection}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialBtn} onPress={onGoogleButtonPress} disabled={loading}>
              <Icon name="google" size={22} color="#DB4437" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <AppleButton
                buttonStyle={AppleButton.Style.WHITE_OUTLINE}
                buttonType={AppleButton.Type.SIGN_IN}
                style={{ flex: 1, height: 48 }}
                onPress={onAppleButtonPress}
              />
            )}
            {Platform.OS !== 'ios' && <View style={{flex: 1}} />}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;