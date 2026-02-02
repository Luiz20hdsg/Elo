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
  TextInput
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

const MY_HOBBIES = ['Café', 'Viagem', 'Academia', 'Netflix'];

const ALL_RELIGIONS = [
  'Assembleia de Deus',
  'Batista',
  'Presbiteriana',
  'Metodista',
  'Luterana',
  'Adventista',
  'Universal',
  'Congregacional',
  'Quadrangular',
  'Deus é Amor',
  'Bola de Neve',
  'Lagoinha',
  'Outros'
];

const ALL_HOBBIES = ['Café', 'Viagem', 'Academia', 'Netflix', 'Games', 'Música', 'Dança', 'Leitura', 'Culinária'];

const MOCK_PROFILES = [
  {
    id: '1',
    name: 'Mariana',
    age: 23,
    distance: '2 km',
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
    distance: '5 km',
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
    distance: '10 km',
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
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    ageMin: '18',
    ageMax: '30',
    distance: '50',
    heightMin: '1.50',
    hasKids: 'indifferent',
    religion: '', 
    selectedHobbies: [] as string[]
  });

  const scrollRef = useRef<ScrollView>(null);
  const mainScrollRef = useRef<ScrollView>(null);
  
  const heartScale = useRef(new Animated.Value(0)).current; 
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const superLikeScale = useRef(new Animated.Value(0)).current;
  const superLikeOpacity = useRef(new Animated.Value(0)).current;

  const currentProfile = MOCK_PROFILES[currentIndex];

  const handleLogout = () => {
    navigation.navigate('Initial');
  };

  const toggleHobbyFilter = (hobby: string) => {
    setFilters(prev => {
        const list = prev.selectedHobbies.includes(hobby)
            ? prev.selectedHobbies.filter(h => h !== hobby)
            : [...prev.selectedHobbies, hobby];
        return { ...prev, selectedHobbies: list };
    });
  };

  const applyFilters = () => {
    setFilterVisible(false);
    console.log("Filtros Aplicados:", filters);
  };

  const nextProfile = () => {
    if (currentIndex < MOCK_PROFILES.length) {
      setCurrentIndex(prev => prev + 1);
      setCurrentPhotoIndex(0);
      if (mainScrollRef.current) mainScrollRef.current.scrollTo({ y: 0, animated: false });
      if (scrollRef.current) scrollRef.current.scrollTo({ x: 0, animated: false });
    }
  };

  const handleLike = () => {
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
  };

  const handleSuperLike = () => {
    Animated.parallel([
      Animated.spring(superLikeScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(superLikeOpacity, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(superLikeOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            superLikeScale.setValue(0);
            nextProfile();
        });
      }, 600);
    });
  };

  const handlePass = () => {
    nextProfile();
  };

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
    scrollContent: { paddingBottom: 120 },
    
    photoContainer: { height: height * 0.55, position: 'relative' },
    photo: { width: width, height: '100%', resizeMode: 'cover' },
    pagination: { position: 'absolute', top: 15, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
    paginationDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
    paginationDotActive: { backgroundColor: '#FFF' },
    
    infoContainer: { padding: 20, marginTop: -20, backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
    nameText: { fontSize: 28, fontWeight: 'bold', color: colors.text },
    ageText: { fontSize: 24, fontWeight: 'normal' },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    locationText: { color: colors.placeholder, marginLeft: 5, fontSize: 14 },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
    detailChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F0F0F0', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: theme === 'dark' ? '#333' : '#E0E0E0' },
    detailText: { color: colors.text, marginLeft: 6, fontSize: 13, fontWeight: '500' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 10, marginTop: 10 },
    bioText: { fontSize: 15, color: colors.text, lineHeight: 22, opacity: 0.8, marginBottom: 25 },
    hobbiesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    hobbyChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
    hobbyText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
    commonHobbyChip: { backgroundColor: colors.primary, borderColor: colors.primary },
    commonHobbyText: { color: '#FFF', fontWeight: 'bold' },
    
    actionButtonsContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 20 },
    actionButton: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8, backgroundColor: theme === 'dark' ? '#2A2A2A' : '#FFF' },
    passButton: { borderWidth: 1, borderColor: '#FF4444' },
    likeButton: { backgroundColor: colors.primary },
    superLikeButton: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#FFF', borderWidth: 3, borderColor: '#FFD700', justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 10, marginBottom: 5 },
    heartOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100, pointerEvents: 'none' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

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
    
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    selectableChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.inputBackground, backgroundColor: 'transparent' },
    selectableChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    selectableChipText: { color: colors.text, fontWeight: '500' },
    selectableChipTextActive: { color: '#FFF', fontWeight: 'bold' },

    applyButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 10, marginBottom: 30 },
    applyButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
  });

  const SelectableChip = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
    <TouchableOpacity 
        style={[styles.selectableChip, active && styles.selectableChipActive]} 
        onPress={onPress}
    >
        <Text style={[styles.selectableChipText, active && styles.selectableChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

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
        <Animated.View style={[styles.heartOverlay, { opacity: superLikeOpacity, transform: [{ scale: superLikeScale }] }]}>
            <Ionicons name="heart" size={180} color="#FFD700" />
        </Animated.View>

        {currentProfile ? (
             <ScrollView ref={mainScrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.photoContainer}>
                    <ScrollView ref={scrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
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
                                    <View key={index} style={[styles.hobbyChip, styles.commonHobbyChip]}><Text style={[styles.hobbyText, styles.commonHobbyText]}>{hobby}</Text></View>
                                ))}
                            </View>
                        </>
                    )}

                    <Text style={styles.sectionTitle}>Interesses</Text>
                    <View style={styles.hobbiesContainer}>
                        {other.map((hobby, index) => (
                            <View key={index} style={styles.hobbyChip}><Text style={styles.hobbyText}>{hobby}</Text></View>
                        ))}
                    </View>
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
                <TouchableOpacity onPress={() => setCurrentIndex(0)} style={{marginTop: 30, padding: 10}}>
                    <Text style={{color: colors.primary, fontWeight: 'bold'}}>Recomeçar Demo</Text>
                </TouchableOpacity>
            </View>
        )}

        {currentProfile && (
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={handlePass}>
                    <Ionicons name="close" size={32} color="#FF4444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.superLikeButton} onPress={handleSuperLike}>
                    <Ionicons name="heart" size={36} color="#FFD700" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
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

                    <View style={styles.rowInputs}>
                        <View style={[styles.filterSection, {flex: 1}]}>
                            <Text style={styles.filterLabel}>Distância (km)</Text>
                            <TextInput 
                                style={styles.inputBox} 
                                keyboardType="numeric" 
                                value={filters.distance}
                                onChangeText={(t) => setFilters({...filters, distance: t})}
                            />
                        </View>
                        <View style={[styles.filterSection, {flex: 1}]}>
                            <Text style={styles.filterLabel}>Altura Mín (m)</Text>
                            <TextInput 
                                style={styles.inputBox} 
                                keyboardType="numeric" 
                                value={filters.heightMin}
                                onChangeText={(t) => setFilters({...filters, heightMin: t})}
                            />
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Possui Filhos?</Text>
                        <View style={styles.chipsRow}>
                            <SelectableChip 
                                label="Sim" 
                                active={filters.hasKids === 'yes'} 
                                onPress={() => setFilters({...filters, hasKids: 'yes'})} 
                            />
                            <SelectableChip 
                                label="Não" 
                                active={filters.hasKids === 'no'} 
                                onPress={() => setFilters({...filters, hasKids: 'no'})} 
                            />
                            <SelectableChip 
                                label="Indiferente" 
                                active={filters.hasKids === 'indifferent'} 
                                onPress={() => setFilters({...filters, hasKids: 'indifferent'})} 
                            />
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Denominação</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={{gap: 10}}
                        >
                            {ALL_RELIGIONS.map((rel) => (
                                <SelectableChip 
                                    key={rel} 
                                    label={rel} 
                                    active={filters.religion === rel} 
                                    onPress={() => setFilters({...filters, religion: rel})} 
                                />
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Hobbies / Interesses</Text>
                        <View style={styles.chipsRow}>
                            {ALL_HOBBIES.map((hobby) => (
                                <SelectableChip 
                                    key={hobby} 
                                    label={hobby} 
                                    active={filters.selectedHobbies.includes(hobby)} 
                                    onPress={() => toggleHobbyFilter(hobby)} 
                                />
                            ))}
                        </View>
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