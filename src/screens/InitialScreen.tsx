import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  StatusBar,
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
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <ImageBackground
      source={require('../assets/images/initial_background.png')}
      resizeMode="cover"
      style={styles.background}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.overlay} />
      
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.logo}>elo</Text>
          <Text style={styles.tagline}>{t('initial.tagline')}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}>
            <Text style={styles.buttonText}>{t('initial.start')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}>
            <Text style={styles.outlineButtonText}>{t('initial.haveAccount')}</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            {t('initial.disclaimer')}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 120,
  },
  topSection: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.85)',
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  outlineButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});

export default InitialScreen;
