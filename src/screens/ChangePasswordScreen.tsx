import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StyledButton from '../components/StyledButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';

type RootStackParamList = {
  Login: undefined;
};

type ChangePasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const ChangePasswordScreen = () => {
  const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
  const { colors, theme, toggleTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);


  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      zIndex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 24,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 1.5,
      borderColor: 'transparent',
      borderRadius: 14,
      marginBottom: 16,
    },
    input: {
      flex: 1,
      color: colors.text,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
    },
    eyeIcon: {
      padding: 12,
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 10, marginLeft: -10 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
          <Ionicons
            name={theme === 'dark' ? 'sunny' : 'moon'}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Alterar Senha</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Senha Atual"
            placeholderTextColor={colors.placeholder}
            secureTextEntry={!isCurrentPasswordVisible}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons name={isCurrentPasswordVisible ? 'eye-off' : 'eye'} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nova Senha"
            placeholderTextColor={colors.placeholder}
            secureTextEntry={!isNewPasswordVisible}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons name={isNewPasswordVisible ? 'eye-off' : 'eye'} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirmar Nova Senha"
            placeholderTextColor={colors.placeholder}
            secureTextEntry={!isConfirmNewPasswordVisible}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />
          <TouchableOpacity onPress={() => setIsConfirmNewPasswordVisible(!isConfirmNewPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons name={isConfirmNewPasswordVisible ? 'eye-off' : 'eye'} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <StyledButton title="Salvar Alterações" onPress={async () => {
          if (!newPassword || !confirmNewPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
          }
          if (newPassword !== confirmNewPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
          }
          if (newPassword.length < 6) {
            Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
            return;
          }
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) {
            Alert.alert('Erro', error.message);
          } else {
            Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        }} />
      </View>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
