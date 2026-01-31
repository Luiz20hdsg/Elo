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

const { width } = Dimensions.get('window');
const GAP = 15;
const PADDING = 20;
// Calcula a largura do card para caberem 2 por linha
const CARD_WIDTH = (width - (PADDING * 2) - GAP) / 2;

const PhotoTipsScreen = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();

  // Dados das 6 dicas
  const photoTips = [
    {
      id: 1,
      title: 'Foto de rosto',
      desc: 'Uma foto clara do seu rosto, sorrindo e sem óculos escuros.',
      icon: 'person-circle-outline',
    },
    {
      id: 2,
      title: 'Corpo inteiro',
      desc: 'Mostre seu estilo e altura. Idealmente em pé e visível.',
      icon: 'body-outline',
    },
    {
      id: 3,
      title: 'Com os amigos',
      desc: 'Mostre que você é sociável.',
      icon: 'people-outline',
    },
    {
      id: 4,
      title: 'Hobby ou Paixão',
      desc: 'Tocando, lendo, cozinhando... Mostre o que você ama fazer.',
      icon: 'musical-notes-outline',
    },
    {
      id: 5,
      title: 'Viagem / Aventura',
      desc: 'Uma foto em um lugar interessante que você visitou.',
      icon: 'airplane-outline',
    },
    {
      id: 6,
      title: 'Espontânea',
      desc: 'Uma foto descontraída, rindo ou brincando com um pet.',
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
      borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 15,
    },
    content: {
      padding: PADDING,
    },
    subtitle: {
      color: '#888',
      fontSize: 16,
      marginBottom: 20,
      lineHeight: 22,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingBottom: 40,
    },
    card: {
      width: CARD_WIDTH,
      marginBottom: 20,
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
      borderRadius: 16,
      padding: 15,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(76, 175, 80, 0.1)', // Fundo verde bem suave
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardTitle: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 8,
    },
    cardDesc: {
      color: '#888',
      fontSize: 13,
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
        <Text style={styles.headerTitle}>Guia de Fotos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.headerTitle, { marginLeft: 0, fontSize: 24, marginBottom: 10 }]}>
          Fotos que funcionam
        </Text>
        <Text style={styles.subtitle}>
          Adicione variedade ao seu perfil para aumentar suas chances de match. Aqui estão 6 tipos essenciais:
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
            padding: 15,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 10
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Entendi</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default PhotoTipsScreen;