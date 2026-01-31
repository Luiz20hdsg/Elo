import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  Animated, // Importado para animação
  Easing
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Initial: undefined;
};

type PeopleScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- MOCK DATA (Lista de Perfis) ---
const MY_HOBBIES = ['Café', 'Viagem', 'Academia', 'Netflix'];

const MOCK_PROFILES = [
  {
    id: '1',
    name: 'Mariana',
    age: 23,
    distance: '2 km de distância',
    bio: 'Apaixonada por café, design e trilhas no fim de semana. ☕✨',
    height: '1.65m',
    job: 'Designer UX/UI',
    education: 'UFMG',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
    ],
    hobbies: ['Café', 'Design', 'Trilhas', 'Música', 'Viagem'],
  },
  {
    id: '2',
    name: 'Carlos',
    age: 25,
    distance: '5 km de distância',
    bio: 'Engenheiro de dia, gamer de noite. Bora fechar esse duo? 🎮',
    height: '1.80m',
    job: 'Eng. Civil',
    education: 'USP',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600',
    ],
    hobbies: ['Academia', 'Netflix', 'Games', 'Futebol'],
  },
  {
    id: '3',
    name: 'Fernanda',
    age: 22,
    distance: '10 km de distância',
    bio: 'Amo animais e viajar o mundo. 🌎🐶',
    height: '1.70m',
    job: 'Veterinária',
    education: 'PUC',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
    ],
    hobbies: ['Viagem', 'Animais', 'Leitura'],
  }
];

const PeopleScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const navigation = useNavigation<PeopleScreenNavigationProp>();
  
  // --- Estados de Controle ---
  const [currentIndex, setCurrentIndex] = useState(0); // Qual perfil está mostrando
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // --- Refs para Animação e Scroll ---
  const scrollRef = useRef<ScrollView>(null);
  const mainScrollRef = useRef<ScrollView>(null);
  
  // Valor animado para o coração (escala 0 a 1)
  const heartScale = useRef(new Animated.Value(0)).current; 
  const heartOpacity = useRef(new Animated.Value(0)).current;

  // Dados do perfil atual (seguro contra index out of bounds)
  const currentProfile = MOCK_PROFILES[currentIndex];

  const handleLogout = () => {
    navigation.navigate('Initial');
  };

  // --- Função para passar para o próximo (Ação do X e fim do Like) ---
  const nextProfile = () => {
    if (currentIndex < MOCK_PROFILES.length) {
      setCurrentIndex(prev => prev + 1);
      setCurrentPhotoIndex(0); // Reseta o carrossel de fotos
      
      // Reseta o scroll da página para o topo
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTo({ y: 0, animated: false });
      }
      // Reseta o scroll das fotos para o inicio
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ x: 0, animated: false });
      }
    }
  };

  // --- Ação de LIKE (Coração) ---
  const handleLike = () => {
    // 1. Inicia animação
    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start(() => {
      // 2. Espera um pouquinho mostrando o coração
      setTimeout(() => {
        // 3. Some com o coração e troca o perfil
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
            heartScale.setValue(0); // Reseta escala para o próximo
            nextProfile();
        });
      }, 600);
    });
  };

  // --- Ação de PASS (X) ---
  const handlePass = () => {
    nextProfile();
  };

  // --- Lógica do Carrossel Automático ---
  useEffect(() => {
    if (!currentProfile) return;

    const interval = setInterval(() => {
      const nextIndex = (currentPhotoIndex + 1) % currentProfile.photos.length;
      setCurrentPhotoIndex(nextIndex);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ x: nextIndex * width, animated: true });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentPhotoIndex, currentProfile]);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundedIndex = Math.round(index);
    if (roundedIndex !== currentPhotoIndex) {
        setCurrentPhotoIndex(roundedIndex);
    }
  };

  // --- Lógica de Interesses ---
  const getInterests = () => {
    if (!currentProfile) return { common: [], other: [] };
    const common = currentProfile.hobbies.filter(h => MY_HOBBIES.includes(h));
    const other = currentProfile.hobbies.filter(h => !MY_HOBBIES.includes(h));
    return { common, other };
  };
  
  const { common, other } = getInterests();

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: 20, paddingBottom: 10, paddingHorizontal: 20,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderBottomWidth: 1, borderBottomColor: colors.inputBackground,
      zIndex: 10, backgroundColor: colors.background,
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    container: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    
    // --- ESTILOS DO CARD ---
    photoContainer: { height: height * 0.55, position: 'relative' },
    photo: { width: width, height: '100%', resizeMode: 'cover' },
    pagination: {
      position: 'absolute', top: 15, left: 0, right: 0,
      flexDirection: 'row', justifyContent: 'center', gap: 5,
    },
    paginationDot: {
      width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    paginationDotActive: { backgroundColor: '#FFF' },

    infoContainer: {
      padding: 20, marginTop: -20, backgroundColor: colors.background,
      borderTopLeftRadius: 30, borderTopRightRadius: 30,
      shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
    nameText: { fontSize: 28, fontWeight: 'bold', color: colors.text },
    ageText: { fontSize: 24, fontWeight: 'normal' },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    locationText: { color: colors.placeholder, marginLeft: 5, fontSize: 14 },

    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
    detailChip: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F0F0F0',
      paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
      borderWidth: 1, borderColor: theme === 'dark' ? '#333' : '#E0E0E0',
    },
    detailText: { color: colors.text, marginLeft: 6, fontSize: 13, fontWeight: '500' },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10, marginTop: 10 },
    bioText: { fontSize: 15, color: colors.text, lineHeight: 22, opacity: 0.8, marginBottom: 25 },

    hobbiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    hobbyChip: {
      paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
      borderWidth: 1, borderColor: colors.primary,
    },
    hobbyText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
    commonHobbyChip: { backgroundColor: colors.primary, borderColor: colors.primary },
    commonHobbyText: { color: '#FFF', fontWeight: 'bold' },

    actionButtonsContainer: {
      position: 'absolute', bottom: 20, left: 0, right: 0,
      flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 30,
    },
    actionButton: {
      width: 64, height: 64, borderRadius: 32,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8,
      backgroundColor: theme === 'dark' ? '#2A2A2A' : '#FFF',
    },
    passButton: { borderWidth: 1, borderColor: '#FF4444' },
    likeButton: { backgroundColor: colors.primary },

    // --- ESTILO DA ANIMAÇÃO DE CORAÇÃO ---
    heartOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100, // Fica por cima de tudo
        pointerEvents: 'none' // Permite clicar através dele se necessário
    },
    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pessoas</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
            <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {/* --- ANIMAÇÃO DE CORAÇÃO OVERLAY --- */}
        <Animated.View style={[styles.heartOverlay, { opacity: heartOpacity, transform: [{ scale: heartScale }] }]}>
            <Ionicons name="heart" size={150} color={colors.primary} />
        </Animated.View>

        {currentProfile ? (
             <ScrollView 
                ref={mainScrollRef}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Fotos */}
                <View style={styles.photoContainer}>
                    <ScrollView 
                        ref={scrollRef}
                        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll} scrollEventThrottle={16}
                    >
                        {currentProfile.photos.map((photo, index) => (
                            <Image key={index} source={{ uri: photo }} style={styles.photo} />
                        ))}
                    </ScrollView>
                    <View style={styles.pagination}>
                        {currentProfile.photos.map((_, index) => (
                            <View key={index} style={[styles.paginationDot, currentPhotoIndex === index && styles.paginationDotActive]} />
                        ))}
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.nameText}>{currentProfile.name}, <Text style={styles.ageText}>{currentProfile.age}</Text></Text>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={16} color={colors.placeholder} />
                        <Text style={styles.locationText}>{currentProfile.distance}</Text>
                    </View>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailChip}><Icon name="ruler" size={16} color={colors.placeholder} /><Text style={styles.detailText}>{currentProfile.height}</Text></View>
                        <View style={styles.detailChip}><Icon name="briefcase-outline" size={16} color={colors.placeholder} /><Text style={styles.detailText}>{currentProfile.job}</Text></View>
                        <View style={styles.detailChip}><Icon name="school-outline" size={16} color={colors.placeholder} /><Text style={styles.detailText}>{currentProfile.education}</Text></View>
                    </View>

                    <Text style={styles.sectionTitle}>Sobre mim</Text>
                    <Text style={styles.bioText}>{currentProfile.bio}</Text>

                    {common.length > 0 && (
                        <>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                                <Ionicons name="sparkles" size={18} color={colors.primary} style={{marginRight: 5}} />
                                <Text style={[styles.sectionTitle, {color: colors.primary, marginBottom: 0, marginTop: 0}]}>Em comum com você</Text>
                            </View>
                            <View style={[styles.hobbiesContainer, { marginBottom: 20 }]}>
                                {common.map((hobby, index) => (
                                    <View key={index} style={[styles.hobbyChip, styles.commonHobbyChip]}>
                                        <Text style={[styles.hobbyText, styles.commonHobbyText]}>{hobby}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    <Text style={styles.sectionTitle}>Interesses</Text>
                    <View style={styles.hobbiesContainer}>
                        {other.map((hobby, index) => (
                            <View key={index} style={styles.hobbyChip}>
                                <Text style={styles.hobbyText}>{hobby}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        ) : (
            // --- ESTADO VAZIO (ACABARAM OS PERFIS) ---
            <View style={styles.emptyState}>
                <View style={[styles.actionButton, {backgroundColor: colors.inputBackground, width: 100, height: 100, borderRadius: 50, marginBottom: 20}]}>
                    <Ionicons name="people-outline" size={50} color={colors.placeholder} />
                </View>
                <Text style={[styles.headerTitle, {textAlign: 'center'}]}>Não há mais ninguém aqui</Text>
                <Text style={{color: colors.placeholder, textAlign: 'center', marginTop: 10}}>
                    Volte mais tarde para ver novas pessoas na sua região.
                </Text>
                <TouchableOpacity 
                    onPress={() => setCurrentIndex(0)} 
                    style={{marginTop: 30, padding: 10}}
                >
                    <Text style={{color: colors.primary, fontWeight: 'bold'}}>Recomeçar Demo</Text>
                </TouchableOpacity>
            </View>
        )}

        {/* Botões só aparecem se tiver perfil */}
        {currentProfile && (
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={handlePass}>
                    <Ionicons name="close" size={32} color="#FF4444" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
                    <Ionicons name="heart" size={32} color="#FFF" />
                </TouchableOpacity>
            </View>
        )}

      </View>
    </SafeAreaView>
  );
};

export default PeopleScreen;