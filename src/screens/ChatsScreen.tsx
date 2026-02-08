import React, { useState, useEffect } from 'react'; // 1. Importe useEffect
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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ForgotPassword: undefined;
  ChatDetail: { userId: string; userName: string; userPhoto: string };
};

type ChatsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>;



type Match = {
  match_id: number;
  other_user_id: string;
  other_user_full_name: string;
  other_user_avatar_url: string;
};

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

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // useFocusEffect will re-run the fetch when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchMatches();
    }, [])
  );

  const fetchMatches = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.rpc('get_matches', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching matches:', error);
      } else {
        setMatches(data || []);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- MUDANÇA AQUI: useEffect roda apenas UMA vez na montagem ---
  useEffect(() => {
    setModalVisible(true);
  }, []); 
  // O array vazio [] garante que só roda quando a tela é criada.
  // Se o usuário trocar de aba e voltar, a tela ainda está na memória e não roda de novo.

  const handleChatPress = (user: { id: string; name: string; photo: string }) => {
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
    
    // Matches
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
        borderColor: colors.primary, 
        padding: 2, 
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
    loadingContainer: {
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Chat List
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
        color: colors.placeholder, 
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
        color: colors.text, 
        fontWeight: '600',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5,
        zIndex: 10,
    },
    modalIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(76, 175, 80, 0.1)', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 15,
        color: colors.placeholder,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
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
        
        {/* MATCHES */}
        <View style={styles.matchesSection}>
            <Text style={styles.sectionTitle}>Seus Matches</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.matchesScroll}
              >
                  {matches.map((match) => (
                      <TouchableOpacity 
                          key={match.match_id} 
                          style={styles.matchItem}
                          onPress={() => handleChatPress({
                            id: match.other_user_id,
                            name: match.other_user_full_name,
                            photo: match.other_user_avatar_url
                          })}
                      >
                          <View style={styles.matchImageContainer}>
                              <Image source={{ uri: match.other_user_avatar_url }} style={styles.matchImage} />
                          </View>
                          <Text style={styles.matchName}>{match.other_user_full_name}</Text>
                      </TouchableOpacity>
                  ))}
              </ScrollView>
            )}
        </View>

        {/* CHATS LIST */}
        <View style={styles.chatList}>
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>Mensagens</Text>
            
            {CHATS_DATA.map((chat) => (
                <TouchableOpacity 
                    key={chat.id} 
                    style={styles.chatItem}
                    onPress={() => handleChatPress(chat)}
                    activeOpacity={0.7}
                >
                    <Image source={{ uri: chat.photo }} style={styles.chatAvatar} />
                    
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

      {/* --- MODAL DE AVISO (Abre apenas na 1ª vez via useEffect) --- */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                {/* Botão X */}
                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setModalVisible(false)}
                >
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.modalIconContainer}>
                    <Ionicons name="shield-checkmark-outline" size={32} color={colors.primary} />
                </View>

                <Text style={styles.modalTitle}>Dica Importante</Text>
                
                <Text style={styles.modalText}>
                    Dica: Favor ser respeitoso e ao começar a conversar com intenção com uma pessoa 
                    <Text style={{fontWeight: 'bold', color: colors.primary}}> seja íntegro priorizando ela.</Text>
                </Text>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default ChatsScreen;