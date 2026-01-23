import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Adicionando import para os ícones de marca
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  PostLogin: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { colors, theme, toggleTheme } = useTheme();

  // The styles are now a function of the colors from the theme
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      zIndex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    logo: {
      fontSize: 48,
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 20,
      fontStyle: 'italic',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.placeholder,
      textAlign: 'center',
      marginBottom: 40,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    forgotPassword: {
      color: colors.placeholder,
      textAlign: 'right',
      marginVertical: 10,
      textDecorationLine: 'underline',
    },
    buttonContainer: {
      marginTop: 10, // Reduzi um pouco pois o painel social já dá espaço
    },
    
    // --- NOVOS ESTILOS DO SOCIAL ---
    socialSection: {
      marginTop: 20,
      marginBottom: 10,
      width: '100%',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.placeholder,
      opacity: 0.3,
    },
    dividerText: {
      marginHorizontal: 10,
      fontSize: 14,
      fontWeight: '500',
      color: colors.placeholder,
    },
    socialButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    socialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48%', 
      paddingVertical: 12,
      borderRadius: 12, 
      borderWidth: 1,
      /* borderColor: colors.boerder || 'rgba(150,150,150,0.2)', */
      backgroundColor: colors.inputBackground || 'transparent',
    },
    socialBtnText: {
      marginLeft: 10,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 10, marginLeft: -10 }}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
          <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.logo}>elo</Text>
        <Text style={styles.subtitle}>
          Ache seu caminho. {'\n'}
          Encontre seu propósito.
        </Text>

        <Text style={styles.title}>Bem-vindo!</Text>

        <StyledInput
          icon="👤"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <StyledInput icon="🔒" placeholder="Senha" isPassword={true} />

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
        </TouchableOpacity>


        <View style={styles.buttonContainer}>
          <StyledButton
            title="Entrar"
            onPress={() => navigation.navigate('Home')}
          />
          <StyledButton
            title="Criar Conta"
            type="outline"
            onPress={() => navigation.navigate('Register')}
          />
        </View>

        {/* --- INÍCIO DO PAINEL SOCIAL --- */}
        <View style={styles.socialSection}>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            {/* Botão Google */}
            <TouchableOpacity 
              style={styles.socialBtn}
              onPress={() => console.log('Login Google')}
            >
              <Icon name="google" size={22} color="#DB4437" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            {/* Botão Facebook */}
            <TouchableOpacity 
              style={styles.socialBtn}
              onPress={() => console.log('Login Facebook')}
            >
              <Icon name="facebook" size={26} color="#4267B2" />
              <Text style={styles.socialBtnText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* --- FIM DO PAINEL SOCIAL --- */}
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;