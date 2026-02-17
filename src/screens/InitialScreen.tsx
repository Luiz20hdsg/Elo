import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

// Define the navigation props for the stack
type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Register: undefined;
};

type InitialScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Initial'
>;

const InitialScreen = () => {
  const navigation = useNavigation<InitialScreenNavigationProp>();
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>  
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />

      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={[styles.appName, { color: colors.primary }]}>elo</Text>
          <Image
            source={require('../assets/images/logo_elo_sem_fundo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.tagline, { color: colors.secondaryText }]}>
            {t('initial.tagline')}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}>
            <Text style={styles.buttonText}>{t('initial.start')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}>
            <Text style={[styles.outlineButtonText, { color: colors.text }]}>
              {t('initial.haveAccount')}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.placeholder }]}>
            {t('initial.disclaimer')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 100,
  },
  topSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoImage: {
    width: 160,
    height: 160,
    marginBottom: 4,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -2,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  button: {
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineButton: {
    paddingVertical: 17,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1.5,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});

export default InitialScreen;
