import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  Alert
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const PHOTO_GAP = 10;
const PHOTO_SIZE = (width - 40 - (2 * PHOTO_GAP)) / 3; // 3 fotos por linha

const EditProfileScreen = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();

  // Estados dos campos
  const [name, setName] = useState('João');
  const [email, setEmail] = useState('joao@email.com');
  const [avatarUri] = useState('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400');

  // Placeholder para o grid de fotos (simulando o que já existe)
  const [galleryPhotos] = useState([
    { id: 1, uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
    { id: 2, uri: null },
    { id: 3, uri: null },
    { id: 4, uri: null },
    { id: 5, uri: null },
    { id: 6, uri: null },
  ]);

  const handleSave = () => {
    // Aqui entra sua lógica de salvar no Backend/Firebase
    Alert.alert('Sucesso', 'Perfil atualizado!');
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
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
        fontSize: 16
    },
    content: {
      padding: 20,
    },
    // Avatar Section
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 30,
        position: 'relative'
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: colors.inputBackground
    },
    changeAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: colors.background
    },
    
    // Form Section
    label: {
        color: colors.placeholder,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4
    },
    input: {
        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
        borderRadius: 12,
        padding: 15,
        color: colors.text,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },

    // Photos Grid Section
    photosTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 10
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
        borderWidth: 1,
        borderColor: 'dashed', // Estilo pontilhado para slots vazios
    },
    photoImage: {
        width: '100%',
        height: '100%'
    },
    photoSubtext: {
        color: colors.placeholder,
        marginBottom: 15,
        fontSize: 13
    },
    photoBoxNoBorder: {
        borderWidth: 0
    },
    photoBoxDashed: {
        borderColor: colors.placeholder,
        borderStyle: 'dashed'
    },
    removeIconView: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        padding: 2
    },
    viewSpacing: {
        height: 40
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Avatar Principal */}
        <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <TouchableOpacity style={styles.changeAvatarButton}>
                <Ionicons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>

        {/* Inputs */}
        <Text style={styles.label}>Nome de usuário</Text>
        <TextInput 
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.placeholder}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput 
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.placeholder}
        />

        {/* Painel de Fotos (Grid) */}
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
                        // Remove borda se tiver foto
                        photo.uri ? styles.photoBoxNoBorder : styles.photoBoxDashed
                    ]}
                >
                    {photo.uri ? (
                        <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                    ) : (
                        <Ionicons name="add" size={30} color={colors.placeholder} />
                    )}
                    
                    {/* Botãozinho de remover na foto existente */}
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