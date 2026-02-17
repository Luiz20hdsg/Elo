import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  Modal, // <--- Importado
  Alert, // <--- Importado
  Dimensions
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { changeLanguage, LANGUAGES } from '../i18n';

type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ForgotPassword: undefined;
  ChangePassword: undefined;
  EditProfile: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>;

interface SettingRowProps {
  text: string;
  icon?: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { t, i18n } = useTranslation();
  
  const [msgNotifications, setMsgNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  
  // --- Estado para controlar a visibilidade da Modal ---
  const [modalVisible, setModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert(t('common.error'), t('settings.logoutError'));
    }
    // O listener em App.tsx cuidará da navegação
  };

  // --- Função para processar a exclusão ---
  const handleDeleteAccount = async () => {
    setModalVisible(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t('common.error'), t('settings.userNotFound'));
        return;
      }

      // Delete user profile (cascades will handle related data)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Sign out
      await supabase.auth.signOut();

      // Show confirmation
      setTimeout(() => {
        Alert.alert(
          t('settings.accountDeleted'),
          t('settings.accountDeletedMessage'),
        );
      }, 300);
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.deleteError'));
    }
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
    container: {
      flex: 1,
    },
    section: {
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.secondaryText,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    rowText: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    versionContainer: {
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 50,
    },
    versionText: {
      color: colors.secondaryText,
      fontSize: 13,
      fontWeight: '600',
    },
    copyrightText: {
      color: colors.secondaryText,
      fontSize: 11,
      marginTop: 4,
    },
    // --- Estilos da Modal ---
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
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        color: colors.secondaryText,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 22,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: colors.inputBackground,
    },
    confirmButton: {
        backgroundColor: colors.danger,
    },
    cancelButtonText: {
        color: colors.text,
        fontWeight: '700',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    }
  });

  const Section = ({ title, children }: SectionProps) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ text, icon, rightContent, onPress }: SettingRowProps) => (
    <TouchableOpacity 
      style={styles.row} 
      onPress={onPress} 
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon && <Icon name={icon} size={22} color={colors.text} style={{ marginRight: 15 }} />}
        <Text style={styles.rowText}>{text}</Text>
      </View>
      {rightContent}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
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

      <ScrollView style={styles.container}>
        <Section title={t('settings.account')}>
          <SettingRow 
            text={t('settings.editProfile')} 
            icon="account-edit-outline"
            rightContent={<Icon name="chevron-right" size={24} color={colors.text} />}
            onPress={() => navigation.navigate('EditProfileScreen' as any)}
          />
          <SettingRow 
            text={t('settings.changePassword')} 
            icon="lock-reset"
            onPress={() => navigation.navigate('ChangePassword')}
            rightContent={<Icon name="chevron-right" size={24} color={colors.text} />}
          />
          <SettingRow 
            text={t('settings.forgotPassword')} 
            icon="lock-question"
            onPress={() => navigation.navigate('ForgotPassword')}
            rightContent={<Icon name="chevron-right" size={24} color={colors.text} />}
          />
        </Section>
        
        <Section title={t('settings.notifications')}>
          <SettingRow 
            text={t('settings.newMessages')}
            icon="email-outline"
            rightContent={
              <Switch
                value={msgNotifications}
                onValueChange={setMsgNotifications}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={"#f4f3f4"}
              />
            }
          />
           <SettingRow 
            text={t('settings.notifyMatch')}
            icon="information-outline"
            rightContent={
              <Switch
                value={matchNotifications}
                onValueChange={setMatchNotifications}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={"#f4f3f4"}
              />
            }
          />
        </Section>

        <Section title={t('settings.language')}>
          <SettingRow 
            text={t('settings.selectLanguage')}
            icon="translate"
            rightContent={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: colors.secondaryText, marginRight: 8, fontSize: 14 }}>
                  {LANGUAGES.find(l => l.code === i18n.language)?.flag} {LANGUAGES.find(l => l.code === i18n.language)?.label}
                </Text>
                <Icon name="chevron-right" size={24} color={colors.text} />
              </View>
            }
            onPress={() => setLanguageModalVisible(true)}
          />
        </Section>
        
        <View style={{ marginVertical: 20, paddingHorizontal: 24 }}>
            <TouchableOpacity 
              style={[styles.row, {justifyContent: 'center', borderBottomWidth: 0, marginBottom: 8}]}
              onPress={handleLogout}
            >
                <Icon name="logout" size={20} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={{...styles.rowText, fontWeight: '700'}}>{t('settings.logout')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.row, {justifyContent: 'center', borderBottomWidth: 0}]}
              onPress={() => setModalVisible(true)}
            >
                <Text style={{...styles.rowText, color: colors.danger, fontWeight: '700'}}>{t('settings.deleteAccount')}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
            <Icon name="cellphone-check" size={28} color={colors.placeholder} style={{ marginBottom: 5 }} />
            <Text style={styles.versionText}>{t('common.version')} 1.0.0</Text>
            <Text style={styles.copyrightText}>{t('common.copyright')}</Text>
        </View>

      </ScrollView>

      {/* --- MODAL DE CONFIRMAÇÃO --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Para fechar com botão voltar do Android
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Icon name="alert-circle-outline" size={50} color="#FF4444" style={{ marginBottom: 15 }} />
                
                <Text style={styles.modalTitle}>{t('settings.deleteConfirmTitle')}</Text>
                <Text style={styles.modalMessage}>
                    {t('settings.deleteConfirmMessage')}
                </Text>

                <View style={styles.modalButtonContainer}>
                    {/* Botão NÃO */}
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>{t('common.no')}</Text>
                    </TouchableOpacity>

                    {/* Botão SIM */}
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.confirmButton]}
                        onPress={handleDeleteAccount}
                    >
                        <Text style={styles.confirmButtonText}>{t('common.yes')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* --- MODAL DE IDIOMA --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
                
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      width: '100%',
                      borderBottomWidth: 1,
                      borderBottomColor: colors.separator,
                      backgroundColor: i18n.language === lang.code ? (theme === 'dark' ? 'rgba(29,185,84,0.15)' : 'rgba(29,185,84,0.08)') : 'transparent',
                      borderRadius: 10,
                    }}
                    onPress={() => {
                      changeLanguage(lang.code);
                      setLanguageModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 22, marginRight: 12 }}>{lang.flag}</Text>
                    <Text style={{ fontSize: 15, fontWeight: i18n.language === lang.code ? '700' : '500', color: i18n.language === lang.code ? colors.primary : colors.text, flex: 1 }}>
                      {lang.label}
                    </Text>
                    {i18n.language === lang.code && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={{ marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.inputBackground, borderRadius: 14 }}
                  onPress={() => setLanguageModalVisible(false)}
                >
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{t('common.close')}</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default SettingsScreen;