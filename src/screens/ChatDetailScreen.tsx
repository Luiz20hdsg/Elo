import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// --- Types ---
type RootStackParamList = {
  ChatDetail: { userId: string; userName: string; userPhoto: string };
};

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

type Message = {
  id: number;
  match_id: number;
  sender_id: string;
  content: string;
  created_at: string;
};

const ChatDetailScreen = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ChatDetailRouteProp>();
  
  const { userId: otherUserId, userName, userPhoto } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [matchId, setMatchId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);

      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUser(user);

      // 2. Find the match ID
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (matchError || !matchData) {
        console.error('Error finding match:', matchError);
        setLoading(false);
        return;
      }
      
      const currentMatchId = matchData.id;
      setMatchId(currentMatchId);

      // 3. Fetch initial messages
      const { data: initialMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', currentMatchId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        setMessages(initialMessages || []);
      }
      
      setLoading(false);
    };

    initializeChat();
  }, [otherUserId]);

  // 4. Set up Realtime subscription
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`messages_match_${matchId}`)
      .on<Message>(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);


  const handleSend = async () => {
    if (inputText.trim().length === 0 || !currentUser || !matchId) return;

    const messageContent = inputText.trim();
    setInputText('');

    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: currentUser.id,
      content: messageContent,
    });

    if (error) {
      console.error('Error sending message:', error);
      // Re-set the input text if sending failed
      setInputText(messageContent);
    }
  };

  useEffect(() => {
    if (!loading) {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }
  }, [messages, loading]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBackground,
      backgroundColor: colors.background,
    },
    headerInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    headerTextContainer: {
        marginLeft: 10,
    },
    name: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    status: {
      fontSize: 12,
      color: colors.primary,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 15
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    myBubble: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        alignSelf: 'flex-start',
        backgroundColor: theme === 'dark' ? '#2A2A2A' : '#E5E5EA',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        color: '#FFF',
    },
    theirMessageText: {
        color: colors.text,
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
        opacity: 0.7,
        color: 'inherit'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: colors.inputBackground,
        backgroundColor: colors.background,
    },
    inputField: {
        flex: 1,
        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F0F0F0',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        color: colors.text,
        maxHeight: 100,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: colors.primary,
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
  });

  const renderMessage = ({ item }: { item: Message }) => {
      const isMe = item.sender_id === currentUser?.id;
      const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return (
          <View style={[
              styles.messageBubble, 
              isMe ? styles.myBubble : styles.theirBubble
          ]}>
              <Text style={[
                  styles.messageText, 
                  !isMe && styles.theirMessageText
              ]}>
                  {item.content}
              </Text>
              <Text style={[
                  styles.timeText, 
                  { color: isMe ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }
              ]}>
                  {time}
              </Text>
          </View>
      );
  };

  if (loading) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Image source={{ uri: userPhoto }} style={styles.avatar} />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.name}>{userName}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
            <Image source={{ uri: userPhoto }} style={styles.avatar} />
            <View style={styles.headerTextContainer}>
                <Text style={styles.name}>{userName}</Text>
                <Text style={styles.status}>Online</Text>
            </View>
        </View>

        <View style={styles.headerActions}>
            <TouchableOpacity>
                <Ionicons name="call-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="videocam-outline" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={{ paddingVertical: 20 }}
            style={styles.messagesContainer}
        />

        <View style={styles.inputContainer}>
            <TouchableOpacity style={{ marginRight: 10 }}>
                <Ionicons name="add-circle-outline" size={28} color={colors.placeholder} />
            </TouchableOpacity>
            
            <TextInput
                style={styles.inputField}
                placeholder="Mensagem..."
                placeholderTextColor={colors.placeholder}
                value={inputText}
                onChangeText={setInputText}
                multiline
            />

            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Ionicons name="send" size={20} color="#FFF" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

export default ChatDetailScreen;
