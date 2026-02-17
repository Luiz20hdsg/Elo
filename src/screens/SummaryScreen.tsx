import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ScrollView,
  ImageBackground,
  Dimensions,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

type RootStackParamList = {
  Home: undefined;
  Main: undefined;
};

interface HobbyItem {
  id: string;
  label: string;
  image: ImageSourcePropType;
}

// LISTA DE HOBBIES ATUALIZADA (Com Foods e Correr)
const HOBBIES_LIST: HobbyItem[] = [
  { id: 'luta', label: 'Luta', image: require('../assets/images/luta.png') },
  { id: 'cantar', label: 'Cantar', image: require('../assets/images/cantar.png') },
  { id: 'basquete', label: 'Basquete', image: require('../assets/images/basquete.png') },
  { id: 'foods', label: 'Foods', image: { uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' } }, // Novo Item (Comida)
  { id: 'correr', label: 'Correr', image: { uri: 'https://images.unsplash.com/photo-1502224562085-639556652f33?w=400' } }, // Novo Item (Corrida)
  { id: 'filmes', label: 'Filmes', image: { uri: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400' } },
  { id: 'futebol', label: 'Futebol', image: { uri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400' } },
  { id: 'volei', label: 'Vôlei', image: { uri: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400' } },
  { id: 'crossfit', label: 'Crossfit', image: { uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' } },
  { id: 'academia', label: 'Academia', image: { uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400' } },
  { id: 'nadar', label: 'Nadar', image: { uri: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400' } },
  { id: 'instrumento', label: 'Música', image: { uri: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400' } },
  { id: 'ler', label: 'Ler', image: { uri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' } },
  { id: 'viajar', label: 'Viajar', image: { uri: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400' } },
  { id: 'dancar', label: 'Dançar', image: { uri: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400' } },
  { id: 'trilha', label: 'Trilha', image: { uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400' } },
  { id: 'praia', label: 'Praia', image: { uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400' } },
  { id: 'cachoeira', label: 'Cachoeira', image: { uri: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400' } },
];

const SummaryScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const [images, setImages] = useState(Array(6).fill(null));
  const [text, setText] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const { t } = useTranslation();
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleImagePick = (index: number) => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const newImages = [...images];
        newImages[index] = response.assets[0].uri;
        setImages(newImages);
      }
    });
  };

  const toggleHobby = (hobbyId: string) => {
    if (selectedHobbies.includes(hobbyId)) {
      setSelectedHobbies((prev) => prev.filter((id) => id !== hobbyId));
    } else {
      if (selectedHobbies.length < 3) {
        setSelectedHobbies((prev) => [...prev, hobbyId]);
      } else {
        Alert.alert(t('summary.limitReached'), t('summary.limitMessage'));
      }
    }
  };

  const handleFinish = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t('common.error'), t('summary.userNotFound'));
        return;
      }

      // Get selected hobby labels
      const selectedHobbyLabels = HOBBIES_LIST
        .filter(h => selectedHobbies.includes(h.id))
        .map(h => h.label);

      const { error } = await supabase
        .from('profiles')
        .update({
          bio: text,
          interests: selectedHobbyLabels,
          updated_at: new Date(),
        })
        .eq('id', user.id);

      if (error) {
        Alert.alert(t('common.error'), error.message);
        return;
      }

      // Navigate back to the main tabs
      navigation.navigate('Tabs' as any);
    } catch (err) {
      Alert.alert(t('common.error'), t('summary.saveError'));
    }
  };

  const isButtonDisabled = selectedHobbies.length < 3 || text.length < 10;

  const dynamicStyles = StyleSheet.create({
    boxPhoto: {
      backgroundColor: theme === 'dark' ? colors.card : '#EAEAEA',
    },
    input: {
      color: colors.text,
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
          <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={22} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{t('summary.yourPhotos')}</Text>
        <View style={styles.gridPhotos}>
          <View style={styles.rowPhotos}>
            {[0, 1, 2].map((index) => (
              <TouchableOpacity key={index} style={[styles.boxPhoto, dynamicStyles.boxPhoto]} onPress={() => handleImagePick(index)}>
                {images[index] ? <Image source={{ uri: images[index] }} style={styles.imagePhoto} /> : <Ionicons name="add" size={28} color={colors.secondaryText} />}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.rowPhotos}>
            {[3, 4, 5].map((index) => (
              <TouchableOpacity key={index} style={[styles.boxPhoto, dynamicStyles.boxPhoto]} onPress={() => handleImagePick(index)}>
                {images[index] ? <Image source={{ uri: images[index] }} style={styles.imagePhoto} /> : <Ionicons name="add" size={28} color={colors.secondaryText} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('summary.bio')}</Text>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          onChangeText={setText}
          value={text}
          placeholder={t('summary.bioPlaceholder')}
          placeholderTextColor={colors.placeholder}
          multiline
        />

        <View style={styles.hobbiesContainer}>
          <View style={styles.hobbiesHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              {t('summary.yourHobbies')}
            </Text>
            <Text style={{ color: selectedHobbies.length === 3 ? colors.primary : colors.secondaryText, fontWeight: '700' }}>
              {selectedHobbies.length}/3
            </Text>
          </View>
          <Text style={{ color: colors.secondaryText, marginBottom: 15, fontSize: 13 }}>{t('summary.selectHobbies')}</Text>

          <View style={styles.hobbiesGrid}>
            {HOBBIES_LIST.map((hobby) => {
              const isSelected = selectedHobbies.includes(hobby.id);
              
              return (
                <Pressable
                  key={hobby.id}
                  onPress={() => toggleHobby(hobby.id)}
                  style={({ pressed }) => [
                    styles.hobbyCard,
                    { 
                      borderWidth: 3, 
                      borderColor: isSelected ? colors.primary : 'transparent' 
                    },
                    pressed && { transform: [{ scale: 1.05 }] }
                  ]}
                >
                  {({ pressed }) => (
                    <ImageBackground
                      source={hobby.image}
                      style={styles.cardImage}
                      imageStyle={{ borderRadius: 12 }}
                      resizeMode="cover"
                    >
                      <View style={[
                        styles.cardOverlay,
                        isSelected && { backgroundColor: 'rgba(0,0,0,0.6)' },
                        pressed && !isSelected && { backgroundColor: 'rgba(0,0,0,0.5)' }
                      ]}>
                        {isSelected && (
                          <View style={styles.checkIcon}>
                            <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
                          </View>
                        )}
                        <Text style={styles.cardText}>{hobby.label}</Text>
                      </View>
                    </ImageBackground>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
      <View style={styles.finishButtonContainer}>
        <TouchableOpacity
          onPress={handleFinish}
          disabled={isButtonDisabled}
          style={[styles.finishButton, isButtonDisabled && styles.disabledButton]}
        >
          <Text style={styles.finishButtonText}>{t('summary.finish')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10
  },
  iconButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 20 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 120, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 15 },
  
  gridPhotos: { marginBottom: 30 },
  rowPhotos: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  boxPhoto: { width: '31%', aspectRatio: 1, borderRadius: 14, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  imagePhoto: { width: '100%', height: '100%' },

  sectionTitle: { fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 10 },
  input: { minHeight: 80, borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 15, textAlignVertical: 'top' },

  hobbiesContainer: { marginTop: 30 },
  hobbiesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hobbiesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  hobbyCard: {
    width: CARD_WIDTH,
    height: 100,
    marginBottom: CARD_GAP,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    zIndex: 2,
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    zIndex: 3,
  },
  finishButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  finishButton: {
    backgroundColor: '#1DB954',
    padding: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
    elevation: 0,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SummaryScreen;