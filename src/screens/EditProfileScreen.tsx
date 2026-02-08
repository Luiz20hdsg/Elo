import React, { useState, useCallback } from 'react';
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
import { supabase } from '../lib/supabase';
import StyledInput from '../components/StyledInput';
import { launchImageLibrary } from 'react-native-image-picker';
import { decode } from 'base64-arraybuffer';

const { width } = Dimensions.get('window');
const PHOTO_GAP = 10;
const PHOTO_SIZE = (width - 40 - (2 * PHOTO_GAP)) / 3; // 3 fotos por linha

const EditProfileScreen = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, bio, avatar_url`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setUsername(data.username || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro ao carregar perfil', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchProfile);

  const handleAvatarChange = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1024,
      maxWidth: 1024,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    const image = result.assets[0];
    if (!image.base64) {
      Alert.alert('Erro', 'Não foi possível obter a imagem em base64.');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      const filePath = `${user.id}`;
      const contentType = image.type || 'image/png';

      await supabase.storage
        .from('avatars')
        .upload(filePath, decode(image.base64), {
          contentType,
          upsert: true,
        });
      
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newAvatarUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;


      await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      setAvatarUrl(newAvatarUrl);
      Alert.alert('Sucesso', 'Avatar atualizado!');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro ao atualizar avatar', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      const updates = {
        id: user.id,
        full_name: fullName,
        username,
        bio,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      Alert.alert('Sucesso', 'Perfil atualizado!');
      navigation.goBack();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Erro ao salvar', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Placeholder para o grid de fotos (simulando o que já existe)
  const [galleryPhotos] = useState([
    { id: 1, uri: avatarUrl || null },
    { id: 2, uri: null },
    { id: 3, uri: null },
    { id: 4, uri: null },
    { id: 5, uri: null },
    { id: 6, uri: null },
  ]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    saveText: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 16,
    },
    content: {
      padding: 20,
    },
    avatarContainer: {
      alignSelf: 'center',
      marginBottom: 30,
      position: 'relative',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.inputBackground,
    },
    changeAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: colors.background,
    },
    label: {
      color: colors.placeholder,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: -2,
      marginLeft: 4,
    },
    photosTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      marginTop: 10,
    },
    photosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: PHOTO_GAP,
    },
    photoBox: {
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#E0E0E0',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    photoImage: {
      width: '100%',
      height: '100%',
    },
    photoSubtext: {
      color: colors.placeholder,
      marginBottom: 15,
      fontSize: 13,
    },
    photoBoxNoBorder: {
      borderWidth: 0,
    },
    photoBoxDashed: {
      borderColor: colors.placeholder,
      borderStyle: 'dashed',
      borderWidth: 1,
    },
    removeIconView: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 10,
      padding: 2,
    },
    viewSpacing: {
      height: 40,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                avatarUrl ||
                'https://i.pinimg.com/736x/a8/57/00/a85700f3c614f6309445dec5537df7b5.jpg',
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changeAvatarButton} onPress={handleAvatarChange}>
            <Ionicons name="camera" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Seu nome</Text>
        <StyledInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nome Completo"
        />

        <Text style={styles.label}>Nome de usuário</Text>
        <StyledInput
          value={username}
          onChangeText={setUsername}
          placeholder="Ex: @joao"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Sua bio</Text>
        <StyledInput
          value={bio}
          onChangeText={setBio}
          placeholder="Fale um pouco sobre você..."
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 15 }}
        />

        <Text style={styles.photosTitle}>Suas Fotos</Text>
        <Text style={styles.photoSubtext}>
          Arraste para reordenar ou toque para substituir.
        </Text>

        <View style={styles.photosGrid}>
          {galleryPhotos.map((photo, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.photoBox,
                photo.uri ? styles.photoBoxNoBorder : styles.photoBoxDashed,
              ]}
            >
              {photo.uri ? (
                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              ) : (
                <Ionicons name="add" size={30} color={colors.placeholder} />
              )}

              {photo.uri && (
                <View style={styles.removeIconView}>
                  <Ionicons name="pencil" size={12} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.viewSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;