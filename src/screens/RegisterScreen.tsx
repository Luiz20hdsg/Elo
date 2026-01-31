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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
    buttonContainer: {
      marginTop: 20,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity
            onPress={() => navigation.navigate('Login')} 
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
          Crie sua conta.
        </Text>

        <Text style={styles.title}>Cadastro</Text>

        <StyledInput
          icon="👤"
          placeholder="Nome de usuário"
          autoCapitalize="none"
        />

        <StyledInput
          icon="✉️"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <StyledInput
          icon="🎂"
          placeholder="Data de nascimento"
          autoCapitalize="none"
        />

        <StyledInput icon="🔒" placeholder="Senha" isPassword={true} />

        <View style={styles.buttonContainer}>
          <StyledButton
            title="Cadastrar"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};



export default RegisterScreen;
