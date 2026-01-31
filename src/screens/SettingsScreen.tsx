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
  
  const [msgNotifications, setMsgNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  
  // --- Estado para controlar a visibilidade da Modal ---
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    navigation.navigate('Initial');
  };

  // --- Função para processar a exclusão ---
  const handleDeleteAccount = () => {
    setModalVisible(false); // Fecha a modal visualmente

    // Pequeno delay para garantir que a modal fechou antes do Alerta
    setTimeout(() => {
        Alert.alert(
            "Conta Deletada",
            "Sua conta foi excluída com sucesso. Esperamos te ver de novo!",
            [
                { 
                    text: "OK", 
                    onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Initial' }] }) 
                }
            ]
        );
    }, 300);
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
    container: {
      flex: 1,
    },
    section: {
      marginTop: 20,
      marginBottom: 10,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.placeholder,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBackground,
    },
    rowText: {
      fontSize: 16,
      color: colors.text,
    },
    versionContainer: {
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 50,
    },
    versionText: {
      color: colors.placeholder,
      fontSize: 14,
      fontWeight: '600',
    },
    copyrightText: {
      color: colors.placeholder,
      fontSize: 12,
      marginTop: 4,
    },
    // --- Estilos da Modal ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        color: colors.placeholder,
        marginBottom: 25,
        textAlign: 'center',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: theme === 'dark' ? '#333' : '#E0E0E0',
    },
    confirmButton: {
        backgroundColor: '#FF4444',
    },
    cancelButtonText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
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
        <Text style={styles.headerTitle}>Ajustes</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
            <Ionicons
              name={theme === 'dark' ? 'sunny' : 'moon'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
            <Icon name="logout" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container}>
        <Section title="Conta">
          <SettingRow 
            text="Editar Perfil" 
            icon="account-edit-outline"
            rightContent={<Icon name="chevron-right" size={24} color={colors.text} />}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingRow 
            text="Alterar Senha" 
            icon="lock-reset"
            onPress={() => navigation.navigate('ChangePassword')}
            rightContent={<Icon name="chevron-right" size={24} color={colors.text} />}
          />
          <SettingRow 
            text="Esqueci minha senha" 
            icon="lock-question"
            onPress={() => navigation.navigate('ForgotPassword')}
            rightContent={<Icon name="chevron-right" size={24} color={colors.text} />}
          />
        </Section>
        
        <Section title="Notificações">
          <SettingRow 
            text="Novas Mensagens"
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
            text="Notificar Match"
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
        
        <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
            <TouchableOpacity 
              style={[styles.row, {justifyContent: 'center', borderBottomWidth: 0}]}
              // --- Ao clicar, abre a modal ---
              onPress={() => setModalVisible(true)}
            >
                <Text style={{...styles.rowText, color: '#FF4444', fontWeight: 'bold'}}>Deletar Conta</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
            <Icon name="cellphone-check" size={28} color={colors.placeholder} style={{ marginBottom: 5 }} />
            <Text style={styles.versionText}>Versão 1.0.0</Text>
            <Text style={styles.copyrightText}>© 2026 Elo App. Todos os direitos reservados.</Text>
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
                
                <Text style={styles.modalTitle}>Excluir conta?</Text>
                <Text style={styles.modalMessage}>
                    Tem certeza que deseja deletar sua conta? Essa ação não pode ser desfeita.
                </Text>

                <View style={styles.modalButtonContainer}>
                    {/* Botão NÃO */}
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>Não</Text>
                    </TouchableOpacity>

                    {/* Botão SIM */}
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.confirmButton]}
                        onPress={handleDeleteAccount}
                    >
                        <Text style={styles.confirmButtonText}>Sim</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default SettingsScreen;