import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

// --- Tipagem de Rotas ---
type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ForgotPassword: undefined;
  ChatDetail: { userId: string; userName: string; userPhoto: string }; // Rota para o chat específico
};

type ChatsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>;

// --- DADOS FAKE (MOCKS) ---
const MATCHES_DATA = [
  { id: '1', name: 'Ana', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { id: '2', name: 'Bia', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400' },
  { id: '3', name: 'Carla', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400' },
  { id: '4', name: 'Dani', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' },
  { id: '5', name: 'Elisa', photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400' },
];

const CHATS_DATA = [
  { 
    id: '1', 
    name: 'Ana', 
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 
    lastMessage: 'Adorei a foto! 😍', 
    time: '10:30', 
    unread: 2 
  },
  { 
    id: '2', 
    name: 'Bia', 
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', 
    lastMessage: 'Vamos marcar aquele café?', 
    time: 'Ontem', 
    unread: 0 
  },
  { 
    id: '7', 
    name: 'Julia', 
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 
    lastMessage: 'Me passa seu insta?', 
    time: 'Dom', 
    unread: 1 
  },
];

const ChatsScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const navigation = useNavigation<ChatsScreenNavigationProp>();

  const handleLogout = () => {
    navigation.navigate('Initial');
  };

 // Função para abrir o chat
 const openChat = (user: { id: string; name: string; photo: string }) => {
  // Agora enviamos os dados reais para a tela de chat
  navigation.navigate('ChatDetail', { 
    userId: user.id, 
    userName: user.name, 
    userPhoto: user.photo 
  });
};

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 20,
      paddingBottom: 10,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBackground,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
    },
    
    // --- Seção de Matches (Superior) ---
    matchesSection: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? '#222' : '#EEE',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginLeft: 20,
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    matchesScroll: {
        paddingLeft: 20,
    },
    matchItem: {
        marginRight: 20,
        alignItems: 'center',
        width: 70,
    },
    matchImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: colors.primary, // Borda verde indicando "Match"
        padding: 2, // Espaço entre borda e foto
        marginBottom: 5,
    },
    matchImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    matchName: {
        color: colors.text,
        fontSize: 12,
        fontWeight: '600',
    },

    // --- Lista de Conversas (Inferior) ---
    chatList: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    chatAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 15,
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    chatTime: {
        fontSize: 12,
        color: colors.placeholder,
    },
    chatFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: colors.placeholder, // Cor cinza para mensagem lida/antiga
        flex: 1,
        marginRight: 10,
    },
    unreadBadge: {
        backgroundColor: colors.primary,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    messageUnreadStyle: {
        color: colors.text, // Texto mais claro se não leu
        fontWeight: '600',
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversas</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
            <Ionicons
              name={theme === 'dark' ? 'sunny' : 'moon'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{flex: 1}}>
        
        {/* --- SEÇÃO 1: MATCHES RECENTES (Horizontal) --- */}
        <View style={styles.matchesSection}>
            <Text style={styles.sectionTitle}>Seus Matches</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.matchesScroll}
            >
                {/* Item Especial: Likes (Blur/Gold) - Exemplo de feature paga */}
                <TouchableOpacity style={styles.matchItem}>
                    <View style={[styles.matchImageContainer, { borderColor: '#FFD700', backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="heart" size={24} color="#FFD700" />
                    </View>
                    <Text style={[styles.matchName, {color: '#FFD700'}]}>Likes</Text>
                </TouchableOpacity>

                {/* Lista de Matches */}
                {MATCHES_DATA.map((match) => (
                    <TouchableOpacity 
                        key={match.id} 
                        style={styles.matchItem}
                        onPress={() => openChat(match)}
                    >
                        <View style={styles.matchImageContainer}>
                            <Image source={{ uri: match.photo }} style={styles.matchImage} />
                        </View>
                        <Text style={styles.matchName}>{match.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* --- SEÇÃO 2: LISTA DE MENSAGENS (Vertical) --- */}
        <View style={styles.chatList}>
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>Mensagens</Text>
            
            {CHATS_DATA.map((chat) => (
                <TouchableOpacity 
                    key={chat.id} 
                    style={styles.chatItem}
                    onPress={() => openChat(chat)}
                    activeOpacity={0.7}
                >
                    {/* Foto da Conversa */}
                    <Image source={{ uri: chat.photo }} style={styles.chatAvatar} />
                    
                    {/* Conteúdo Texto */}
                    <View style={styles.chatContent}>
                        <View style={styles.chatHeader}>
                            <Text style={styles.chatName}>{chat.name}</Text>
                            <Text style={[
                                styles.chatTime, 
                                chat.unread > 0 && { color: colors.primary, fontWeight: 'bold' }
                            ]}>
                                {chat.time}
                            </Text>
                        </View>
                        
                        <View style={styles.chatFooter}>
                            <Text 
                                numberOfLines={1} 
                                style={[
                                    styles.lastMessage, 
                                    chat.unread > 0 && styles.messageUnreadStyle
                                ]}
                            >
                                {chat.lastMessage}
                            </Text>
                            
                            {/* Badge de Não Lida */}
                            {chat.unread > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>{chat.unread}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatsScreen;