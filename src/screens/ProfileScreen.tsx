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
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../../lib/supabase';

type RootStackParamList = {
  Initial: undefined;
  PhotoTips: undefined;
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
  } | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error, status } = await supabase
          .from('profiles')
          .select(`username, full_name, avatar_url, bio`)
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
      paddingHorizontal: 20,
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
      backgroundColor: 'rgba(30, 30, 30, 0.6)',
      borderRadius: 15,
      padding: 6,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      zIndex: 10,
    },
    percentageBadge: {
      position: 'absolute',
      bottom: -5,
      alignSelf: 'center',
      backgroundColor: '#333',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.text,
      zIndex: 10,
    },
    percentageText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 5,
    },
    editButton: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.text,
      alignSelf: 'flex-start',
    },
    editButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
    chipsScroll: {
      marginTop: 25,
      paddingLeft: 20,
    },
    chipItem: {
      marginRight: 20,
    },
    chipText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#888',
    },
    chipTextActive: {
      color: colors.text,
    },
    dot: {
      color: 'red',
      fontSize: 20,
      lineHeight: 18,
    },
    actionGrid: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      marginTop: 25,
    },
    actionCard: {
      width: (width - 50) / 2,
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
      borderRadius: 12,
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center',
      height: 100,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#333',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionTitle: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: 16,
    },
    actionSubtitle: {
      color: '#888',
      fontSize: 12,
      marginTop: 2,
    },
    bannerContainer: {
        marginHorizontal: 20,
        marginTop: 25,
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
    },
    bannerSlide: {
        width: BANNER_WIDTH,
        backgroundColor: colors.primary,
        padding: 20,
        justifyContent: 'center',
        height: '100%',
    },
    premiumBadge: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginBottom: 10,
    },
    premiumBadgeText: {
      color: '#FFF',
      fontWeight: '900',
      fontStyle: 'italic',
      fontSize: 12,
    },
    premiumText: {
      color: '#FFF',
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 15,
      fontWeight: '500',
    },
    premiumButton: {
      backgroundColor: '#FFF',
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
    },
    premiumButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    pagination: {
        position: 'absolute',
        bottom: 10,
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
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    paginationDotActive: {
        backgroundColor: '#FFF',
        width: 18,
    },
    advantagesSection: {
      paddingHorizontal: 20,
      marginTop: 25,
      marginBottom: 40,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
      alignItems: 'center',
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    toggleRow: {
      flexDirection: 'row',
    },
    toggleButton: {
      marginLeft: 15,
    },
    toggleText: {
      fontSize: 16,
      fontWeight: '600',
    },
    advantageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    advantageText: {
      fontSize: 16,
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
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' , marginTop:25}}>
        <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
          <Ionicons
            name={theme === 'dark' ? 'sunny' : 'moon'}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
          <Icon name="logout" size={24} color={colors.text} />
        </TouchableOpacity>
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
              <Ionicons name="pencil" size={14} color="#D3D3D3" />
            </TouchableOpacity>

            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>40%</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{profile?.full_name || 'Usuário'}</Text>
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