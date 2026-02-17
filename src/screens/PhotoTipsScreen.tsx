import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Ajuste o caminho conforme sua estrutura
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const GAP = 15;
const PADDING = 20;
// Calcula a largura do card para caberem 2 por linha
const CARD_WIDTH = (width - (PADDING * 2) - GAP) / 2;

const PhotoTipsScreen = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Dados das 6 dicas
  const photoTips = [
    {
      id: 1,
      title: t('photoTips.facePhoto'),
      desc: t('photoTips.facePhotoDesc'),
      icon: 'person-circle-outline',
    },
    {
      id: 2,
      title: t('photoTips.fullBody'),
      desc: t('photoTips.fullBodyDesc'),
      icon: 'body-outline',
    },
    {
      id: 3,
      title: t('photoTips.withFriends'),
      desc: t('photoTips.withFriendsDesc'),
      icon: 'people-outline',
    },
    {
      id: 4,
      title: t('photoTips.hobbyOrPassion'),
      desc: t('photoTips.hobbyOrPassionDesc'),
      icon: 'musical-notes-outline',
    },
    {
      id: 5,
      title: t('photoTips.travel'),
      desc: t('photoTips.travelDesc'),
      icon: 'airplane-outline',
    },
    {
      id: 6,
      title: t('photoTips.spontaneous'),
      desc: t('photoTips.spontaneousDesc'),
      icon: 'camera-outline',
    },
  ];

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 15,
    },
    content: {
      padding: PADDING,
    },
    subtitle: {
      color: colors.secondaryText,
      fontSize: 14,
      marginBottom: 24,
      lineHeight: 22,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingBottom: 30,
    },
    card: {
      width: CARD_WIDTH,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.separator,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === 'dark' ? 0.15 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme === 'dark' ? 'rgba(29, 185, 84, 0.15)' : 'rgba(29, 185, 84, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 6,
    },
    cardDesc: {
      color: colors.secondaryText,
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('photoTips.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.headerTitle, { marginLeft: 0, fontSize: 24, marginBottom: 10 }]}>
          {t('photoTips.header')}
        </Text>
        <Text style={styles.subtitle}>
          {t('photoTips.subtitle')}
        </Text>

        <View style={styles.gridContainer}>
          {photoTips.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.iconContainer}>
                {/* Ícone na cor primária (Verde) */}
                <Ionicons name={item.icon} size={32} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={{
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 28,
            alignItems: 'center',
            marginTop: 4,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 }}>{t('photoTips.understood')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default PhotoTipsScreen;