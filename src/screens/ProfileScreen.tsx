import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';

type RootStackParamList = {
  Initial: undefined;
  PhotoTips: undefined;
  EditProfileScreen: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40; 

const ProfileScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erro', 'Não foi possível fazer o logout.');
    }
    // O listener em App.tsx cuidará da navegação
  };

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    username: string;
    full_name: string;
    avatar_url: string;
    bio: string;
    age: number | null;
  } | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error, status } = await supabase
          .from('profiles_with_age')
          .select(`username, full_name, avatar_url, bio, age`)
          .eq('id', user.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setProfile(data);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro', 'Não foi possível carregar o perfil.');
        console.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const [activeChip, setActiveChip] = useState<'advice' | 'photos'>('advice');
  const [selectedTab, setSelectedTab] = useState<'plus' | 'standard' | 'free'>('plus');
  
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      setActiveChip('advice');
      fetchProfile();
    }, [fetchProfile]),
  );

  const BANNER_SLIDES = [
    {
      id: 'plus',
      title: 'PREMIUM+',
      desc: 'Receba tratamento VIP e venha se conectar com pessoas incríveis da melhor forma.',
    },
    {
      id: 'standard',
      title: 'LIGHT',
      desc: 'Desbloqueie recursos essenciais para encontrar seu par ideal mais rápido.',
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (bannerIndex + 1) % BANNER_SLIDES.length;
      setBannerIndex(nextIndex);
      
      if (bannerScrollRef.current) {
        bannerScrollRef.current.scrollTo({
          x: nextIndex * BANNER_WIDTH,
          animated: true,
        });
      }
    }, 4000); 

    return () => clearInterval(interval);
  }, [bannerIndex]);

  const handleBannerScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundedIndex = Math.round(index);
    
    if (roundedIndex !== bannerIndex) {
      setBannerIndex(roundedIndex);
    }
  };

  const featuresData = {
    plus: [
      { text: 'Ganhe destaque máximo no feed', included: true },
      { text: 'Potencialize suas curtidas', included: true },
      { text: 'Envie curtidas e comentários ilimitados', included: true },
      { text: 'Ver quem te curtiu', included: true },
      { text: '5 SUper Likes por dia', included: true },
      { text: 'Filtro completo (religião, altura, idade...)', included: true },
    ],
    standard: [
      { text: 'Ganhe destaque no feed', included: true },
      { text: 'Curtidas ilimitadas', included: true },
      { text: '3 SUper Likes por dia', included: true },
      { text: 'Potencialize suas curtidas', included: false },
      { text: 'Ver quem te curtiu', included: false },
    ],
    free: [
      { text: 'Curtidas limitadas por dia', included: true },
      { text: '1 Super Like por dia', included: true },
      { text: 'Ganhe destaque no feed', included: false },
      { text: 'Potencialize suas curtidas', included: false },
      { text: 'Perfil básico de tempo', included: false },
    ],
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginTop: 20,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 20,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    editIconWrapper: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: 14,
      padding: 6,
      borderWidth: 2,
      borderColor: colors.background,
      zIndex: 10,
    },
    percentageBadge: {
      position: 'absolute',
      bottom: -5,
      alignSelf: 'center',
      backgroundColor: colors.cardElevated,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.primary,
      zIndex: 10,
    },
    percentageText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: '800',
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
    },
    editButton: {
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignSelf: 'flex-start',
      backgroundColor: colors.card,
    },
    editButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 13,
    },
    chipsScroll: {
      marginTop: 28,
      paddingLeft: 24,
    },
    chipItem: {
      marginRight: 24,
    },
    chipText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.secondaryText,
    },
    chipTextActive: {
      color: colors.text,
    },
    dot: {
      color: colors.primary,
      fontSize: 20,
      lineHeight: 18,
    },
    actionGrid: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      justifyContent: 'space-between',
      marginTop: 24,
    },
    actionCard: {
      width: (width - 58) / 2,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      justifyContent: 'center',
      height: 110,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === 'dark' ? 0.2 : 0.06,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.separator,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    actionTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 15,
    },
    actionSubtitle: {
      color: colors.secondaryText,
      fontSize: 12,
      marginTop: 2,
    },
    bannerContainer: {
        marginHorizontal: 24,
        marginTop: 24,
        height: 180,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    bannerSlide: {
        width: BANNER_WIDTH,
        backgroundColor: colors.primary,
        padding: 22,
        justifyContent: 'center',
        height: '100%',
    },
    premiumBadge: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
      marginBottom: 10,
    },
    premiumBadgeText: {
      color: '#FFF',
      fontWeight: '900',
      fontStyle: 'italic',
      fontSize: 12,
      letterSpacing: 0.5,
    },
    premiumText: {
      color: '#FFF',
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 16,
      fontWeight: '500',
    },
    premiumButton: {
      backgroundColor: '#FFF',
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    premiumButtonText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 14,
    },
    pagination: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    paginationDotActive: {
        backgroundColor: '#FFF',
        width: 20,
    },
    advantagesSection: {
      paddingHorizontal: 24,
      marginTop: 28,
      marginBottom: 40,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      alignItems: 'center',
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
    toggleRow: {
      flexDirection: 'row',
    },
    toggleButton: {
      marginLeft: 14,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '600',
    },
    advantageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    advantageText: {
      fontSize: 14,
      flex: 1,
      fontWeight: '500',
    },
  });

  const getTextColor = (tabName: 'plus' | 'standard' | 'free') => {
    return selectedTab === tabName ? colors.text : '#666';
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>Meu Perfil</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
            <Ionicons
              name={theme === 'dark' ? 'sunny' : 'moon'}
              size={22}
              color={colors.secondaryText}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
              }}
              style={styles.avatar}
            />

            <TouchableOpacity style={styles.editIconWrapper} onPress={() => navigation.navigate('EditProfileScreen' as any)}>
              <Ionicons name="pencil" size={12} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>40%</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {profile?.full_name || 'Usuário'}
              {profile?.age && `, ${profile.age}`}
            </Text>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfileScreen' as any)}>
              <Text style={styles.editButtonText}>Completar perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <TouchableOpacity
            style={styles.chipItem}
            onPress={() => setActiveChip('advice')}
          >
            <Text
              style={[
                styles.chipText,
                activeChip === 'advice' && styles.chipTextActive,
              ]}
            >
              Planos
              {activeChip === 'advice' && <Text style={styles.dot}> •</Text>}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chipItem}
            onPress={() => {
              setActiveChip('photos');
              navigation.navigate('PhotoTips' as any);
            }}
          >
            <Text
              style={[
                styles.chipText,
                activeChip === 'photos' && styles.chipTextActive,
              ]}
            >
              Melhore suas fotos
              {activeChip === 'photos' && <Text style={styles.dot}> •</Text>}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="star" size={20} color="#FFF" />
            </View>
            <Text style={styles.actionTitle}>Spotlight</Text>
            <Text style={styles.actionSubtitle}>Ganhe destaque</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.iconCircle}>
              {/* --- MUDANÇA AQUI: Ícone e Texto alterados --- */}
              <Ionicons name="heart" size={20} color="#FFF" />
            </View>
            <Text style={styles.actionTitle}>Super Like</Text>
            <Text style={styles.actionSubtitle}>Chame atenção</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bannerContainer}>
             <ScrollView
                ref={bannerScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleBannerScroll}
                scrollEventThrottle={16}
             >
                {BANNER_SLIDES.map((slide, index) => (
                    <View key={index} style={styles.bannerSlide}>
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumBadgeText}>
                                {slide.title}
                            </Text>
                        </View>
                        <Text style={styles.premiumText}>
                            {slide.desc}
                        </Text>
                        <TouchableOpacity 
                            style={styles.premiumButton}
                            onPress={() => setSelectedTab(slide.id as any)}
                        >
                            <Text style={styles.premiumButtonText}>
                                Explorar {slide.title}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
             </ScrollView>
             
             <View style={styles.pagination}>
                {BANNER_SLIDES.map((_, index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.paginationDot, 
                            bannerIndex === index && styles.paginationDotActive
                        ]} 
                    />
                ))}
             </View>
        </View>

        <View style={styles.advantagesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Suas vantagens:</Text>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                onPress={() => setSelectedTab('plus')}
                style={styles.toggleButton}
              >
                <Text
                  style={[styles.toggleText, { color: getTextColor('plus') }]}
                >
                  Premium+
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedTab('standard')}
                style={styles.toggleButton}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: getTextColor('standard') },
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedTab('free')}
                style={styles.toggleButton}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: getTextColor('free') },
                  ]}
                >
                  Free
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {featuresData[selectedTab].map((item, index) => (
            <View key={index} style={styles.advantageRow}>
              <Text
                style={[
                  styles.advantageText,
                  { color: item.included ? colors.text : '#888' },
                ]}
              >
                {item.text}
              </Text>

              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#666"
                style={{ marginRight: 10 }}
              />

              <Ionicons
                name={item.included ? 'checkmark' : 'close'}
                size={24}
                color={item.included ? colors.primary : '#FF4444'}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;