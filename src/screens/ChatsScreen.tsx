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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

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

const ChatsScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const navigation = useNavigation<ChatsScreenNavigationProp>();
  const { t } = useTranslation();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

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
      paddingTop: 16,
      paddingBottom: 12,
      paddingHorizontal: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    
    // Matches
    matchesSection: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
        marginLeft: 24,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    matchesScroll: {
        paddingLeft: 24,
    },
    matchItem: {
        marginRight: 18,
        alignItems: 'center',
        width: 68,
    },
    matchImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2.5,
        borderColor: colors.primary, 
        padding: 2, 
        marginBottom: 6,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    matchImage: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
    },
    matchName: {
        color: colors.text,
        fontSize: 11,
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
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    chatAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: 14,
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
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
    },
    chatTime: {
        fontSize: 11,
        color: colors.secondaryText,
    },
    chatFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 13,
        color: colors.secondaryText, 
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
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        position: 'relative',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 5,
        zIndex: 10,
    },
    modalIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme === 'dark' ? 'rgba(29, 185, 84, 0.15)' : 'rgba(29, 185, 84, 0.1)', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 14,
        color: colors.secondaryText,
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
        <Text style={styles.headerTitle}>{t('chats.title')}</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
            <Ionicons
              name={theme === 'dark' ? 'sunny' : 'moon'}
              size={22}
              color={colors.secondaryText}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{flex: 1}}>
        
        {/* MATCHES */}
        <View style={styles.matchesSection}>
            <Text style={styles.sectionTitle}>{t('chats.yourMatches')}</Text>
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

        {/* CHATS LIST - use real matches as chat conversations */}
        <View style={styles.chatList}>
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>{t('chats.messages')}</Text>
            
            {matches.length === 0 && !loading ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="chatbubbles-outline" size={44} color={colors.secondaryText} />
                <Text style={{ color: colors.secondaryText, marginTop: 12, fontSize: 14, fontWeight: '500' }}>
                  {t('chats.noConversations')}
                </Text>
              </View>
            ) : (
              matches.map((match) => (
                <TouchableOpacity 
                    key={match.match_id} 
                    style={styles.chatItem}
                    onPress={() => handleChatPress({
                      id: match.other_user_id,
                      name: match.other_user_full_name || t('profile.user'),
                      photo: match.other_user_avatar_url
                    })}
                    activeOpacity={0.7}
                >
                    <Image source={{ uri: match.other_user_avatar_url }} style={styles.chatAvatar} />
                    
                    <View style={styles.chatContent}>
                        <View style={styles.chatHeader}>
                            <Text style={styles.chatName}>{match.other_user_full_name || t('profile.user')}</Text>
                        </View>
                        
                        <View style={styles.chatFooter}>
                            <Text 
                                numberOfLines={1} 
                                style={styles.lastMessage}
                            >
                              {t('chats.tapToChat')}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
              ))
            )}
        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default ChatsScreen;