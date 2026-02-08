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
  Animated,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Initial: undefined;
};

type PeopleScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Tipagem para o perfil recomendado
type RecommendedProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  interests: string[];
  recommendation_score: number;
};

const PeopleScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const navigation = useNavigation<PeopleScreenNavigationProp>();

  const [recommendations, setRecommendations] = useState<RecommendedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [filterVisible, setFilterVisible] = useState(false);
  // Mantenha os filtros se eles ainda forem úteis para uma futura filtragem no lado do cliente ou servidor
  const [filters, setFilters] = useState({
    ageMin: '18',
    ageMax: '30',
    distance: '50',
  });

  const mainScrollRef = useRef<ScrollView>(null);
  
  const heartScale = useRef(new Animated.Value(0)).current; 
  const heartOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase.rpc('get_recommendations', {
        current_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching recommendations:', error);
      } else {
        setRecommendations(data || []);
        setCurrentIndex(0); // Reset index on new fetch
      }
    }
    setLoading(false);
  };

  const currentProfile = recommendations[currentIndex];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // O App.tsx irá lidar com a navegação para a tela de login
  };

  const applyFilters = () => {
    setFilterVisible(false);
    console.log("Filtros Aplicados:", filters);
    // Aqui você pode adicionar a lógica para refazer a busca com filtros
  };

  const nextProfile = () => {
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(prev => prev + 1);
      if (mainScrollRef.current) mainScrollRef.current.scrollTo({ y: 0, animated: false });
    } else {
      // Chegou ao fim da lista
      setCurrentIndex(recommendations.length);
    }
  };
  
  const handleInteraction = async (targetUserId: string, action: 'like' | 'dislike') => {
    if (!currentProfile) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Animação primeiro para uma UI mais responsiva
    if (action === 'like') {
      Animated.parallel([
        Animated.spring(heartScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(heartOpacity, { toValue: 1, duration: 100, useNativeDriver: true })
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(heartOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
              heartScale.setValue(0);
              nextProfile();
          });
        }, 600);
      });
    } else {
      // Se for 'dislike', apenas avança
      nextProfile();
    }

    // Chama a função do Supabase em segundo plano
    const { data: isMatch, error } = await supabase.rpc('handle_interaction', {
      p_user_id: user.id,
      p_target_user_id: targetUserId,
      p_action: action,
    });

    if (error) {
      console.error(`Error handling ${action}:`, error);
    }

    if (isMatch) {
      Alert.alert("É um Match!", `Você e ${currentProfile.full_name || currentProfile.username} se curtiram!`);
      // Aqui você pode navegar para a tela de chat ou mostrar uma animação de match
    }
  };

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
    scrollContent: { paddingBottom: 120 },
    
    photoContainer: { height: height * 0.55, position: 'relative', backgroundColor: colors.inputBackground },
    photo: { width: width, height: '100%', resizeMode: 'cover' },
    
    infoContainer: { padding: 20, marginTop: -20, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
    nameText: { fontSize: 28, fontWeight: 'bold', color: colors.text },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    locationText: { color: colors.placeholder, marginLeft: 5, fontSize: 14 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10, marginTop: 10 },
    bioText: { fontSize: 15, color: colors.text, lineHeight: 22, opacity: 0.8, marginBottom: 25 },
    hobbiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    hobbyChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
    hobbyText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
    
    actionButtonsContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 20 },
    actionButton: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8, backgroundColor: theme === 'dark' ? '#2A2A2A' : '#FFF' },
    passButton: { borderWidth: 1, borderColor: '#FF4444' },
    likeButton: { backgroundColor: colors.primary },
    superLikeButton: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#FFF', borderWidth: 3, borderColor: '#FFD700', justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 10, marginBottom: 5 },
    heartOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100, pointerEvents: 'none' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '85%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.inputBackground, paddingBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    filterSection: { marginBottom: 25 },
    filterLabel: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
    
    rowInputs: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    inputGroup: { flex: 1 },
    inputLabelSmall: { fontSize: 12, color: colors.placeholder, marginBottom: 5 },
    inputBox: { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5', borderRadius: 10, padding: 12, color: colors.text, fontSize: 16, borderWidth: 1, borderColor: colors.inputBackground, textAlign: 'center' },
    
    applyButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 10, marginBottom: 30 },
    applyButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>Buscando pessoas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pessoas</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => setFilterVisible(true)} style={{ padding: 10 }}>
             <Ionicons name="options-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
            <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <Animated.View style={[styles.heartOverlay, { opacity: heartOpacity, transform: [{ scale: heartScale }] }]}>
            <Ionicons name="heart" size={150} color={colors.primary} />
        </Animated.View>

        {currentProfile ? (
             <ScrollView ref={mainScrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.photoContainer}>
                    <Image source={{ uri: currentProfile.avatar_url }} style={styles.photo} />
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.nameText}>{currentProfile.full_name || currentProfile.username}</Text>
                        {/* Adicionar idade e verificação se disponível */}
                    </View>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={16} color={colors.placeholder} />
                        {/* Adicionar distância se disponível */}
                        <Text style={styles.locationText}>A alguns km de você</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Sobre mim</Text>
                    <Text style={styles.bioText}>{currentProfile.bio || 'Nenhuma bio ainda.'}</Text>

                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                      <>
                        <Text style={styles.sectionTitle}>Interesses</Text>
                        <View style={styles.hobbiesContainer}>
                            {currentProfile.interests.map((hobby, index) => (
                                <View key={index} style={styles.hobbyChip}><Text style={styles.hobbyText}>{hobby}</Text></View>
                            ))}
                        </View>
                      </>
                    )}
                </View>
            </ScrollView>
        ) : (
            <View style={styles.emptyState}>
                <View style={[styles.actionButton, {backgroundColor: colors.inputBackground, width: 100, height: 100, borderRadius: 50, marginBottom: 20}]}>
                    <Ionicons name="people-outline" size={50} color={colors.placeholder} />
                </View>
                <Text style={[styles.headerTitle, {textAlign: 'center'}]}>Não há mais ninguém aqui</Text>
                <Text style={{color: colors.placeholder, textAlign: 'center', marginTop: 10}}>
                    Volte mais tarde para ver novas pessoas na sua região.
                </Text>
                <TouchableOpacity onPress={fetchRecommendations} style={{marginTop: 30, padding: 10}}>
                    <Text style={{color: colors.primary, fontWeight: 'bold'}}>Buscar Novamente</Text>
                </TouchableOpacity>
            </View>
        )}

        {currentProfile && (
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={() => handleInteraction(currentProfile.id, 'dislike')}>
                    <Ionicons name="close" size={32} color="#FF4444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.superLikeButton} onPress={() => console.log("Super Like não implementado")}>
                    <Ionicons name="heart" size={36} color="#FFD700" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={() => handleInteraction(currentProfile.id, 'like')}>
                    <Ionicons name="heart" size={32} color="#FFF" />
                </TouchableOpacity>
            </View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Filtros</Text>
                    <TouchableOpacity onPress={() => setFilterVisible(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Idade</Text>
                        <View style={styles.rowInputs}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabelSmall}>De</Text>
                                <TextInput 
                                    style={styles.inputBox} 
                                    keyboardType="numeric" 
                                    value={filters.ageMin}
                                    onChangeText={(t) => setFilters({...filters, ageMin: t})}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabelSmall}>Até</Text>
                                <TextInput 
                                    style={styles.inputBox} 
                                    keyboardType="numeric" 
                                    value={filters.ageMax}
                                    onChangeText={(t) => setFilters({...filters, ageMax: t})}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Distância (km)</Text>
                        <TextInput 
                            style={styles.inputBox} 
                            keyboardType="numeric" 
                            value={filters.distance}
                            onChangeText={(t) => setFilters({...filters, distance: t})}
                        />
                    </View>

                    <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                        <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default PeopleScreen;
