import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// --- Tipagem dos Parâmetros Recebidos ---
type RootStackParamList = {
  ChatDetail: { userId: string; userName: string; userPhoto: string };
};

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

// --- DADOS FAKE INICIAIS ---
const INITIAL_MESSAGES = [
  { id: '1', text: 'Oii! Tudo bem?', sender: 'them', time: '10:30' },
  { id: '2', text: 'Oie, tudo ótimo e com você?', sender: 'me', time: '10:31' },
  { id: '3', text: 'Tudo certo também! Adorei suas fotos de viagem.', sender: 'them', time: '10:32' },
];

const ChatDetailScreen = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ChatDetailRouteProp>();
  
  // Pegando dados passados pela tela anterior
  const { userName, userPhoto } = route.params;

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Função para Enviar Mensagem
  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  // Rolar para o fim quando chegar mensagem nova
  useEffect(() => {
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // --- Header ---
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
      color: colors.primary, // "Online" em verde
    },
    headerActions: {
        flexDirection: 'row',
        gap: 15
    },

    // --- Lista de Mensagens ---
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
    // Balão MEU (Direita)
    myBubble: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4, // Efeito visual de chat
    },
    // Balão DELE(A) (Esquerda)
    theirBubble: {
        alignSelf: 'flex-start',
        backgroundColor: theme === 'dark' ? '#2A2A2A' : '#E5E5EA',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        color: '#FFF', // Texto branco no meu balão fica melhor
    },
    theirMessageText: {
        color: colors.text, // Cor normal no balão cinza
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
        opacity: 0.7,
        color: 'inherit'
    },

    // --- Barra de Input ---
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
    }
  });

  const renderMessage = ({ item }: { item: any }) => {
      const isMe = item.sender === 'me';
      return (
          <View style={[
              styles.messageBubble, 
              isMe ? styles.myBubble : styles.theirBubble
          ]}>
              <Text style={[
                  styles.messageText, 
                  !isMe && styles.theirMessageText
              ]}>
                  {item.text}
              </Text>
              <Text style={[
                  styles.timeText, 
                  { color: isMe ? 'rgba(255,255,255,0.7)' : colors.placeholder }
              ]}>
                  {item.time}
              </Text>
          </View>
      );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* HEADER */}
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

      {/* ÁREA DE MENSAGENS */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 20 }}
            style={styles.messagesContainer}
        />

        {/* BARRA DE INPUT */}
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