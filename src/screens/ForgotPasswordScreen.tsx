import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StyledButton from '../components/StyledButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  Login: undefined;
};

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { colors, theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert(t('common.error'), t('forgotPassword.errorFillEmail'));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: '', // Você pode adicionar um link para redirecionar aqui
    });

    if (error) {
      Alert.alert(t('common.error'), error.message);
    } else {
      Alert.alert(
        t('common.success'),
        t('forgotPassword.successMessage')
      );
    }
    setLoading(false);
  };

  const styles = useMemo(() => StyleSheet.create({
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
      paddingHorizontal: 28,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: 28,
      lineHeight: 22,
    },
    input: {
      backgroundColor: colors.inputBackground,
      color: colors.text,
      borderWidth: 1.5,
      borderColor: 'transparent',
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      marginBottom: 20,
    },
  }), [colors, theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 10, marginLeft: -10 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
          <Ionicons
            name={theme === 'dark' ? 'sunny' : 'moon'}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>{t('forgotPassword.title')}</Text>
        <Text style={styles.subtitle}>
          {t('forgotPassword.subtitle')}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t('forgotPassword.emailPlaceholder')}
          placeholderTextColor={colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <StyledButton 
          title={loading ? t('forgotPassword.sending') : t('forgotPassword.send')} 
          onPress={handlePasswordReset} 
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
