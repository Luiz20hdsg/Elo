import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StyledButton from '../components/StyledButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderRadius: 12,
      marginBottom: 20,
    },
    input: {
      flex: 1,
      color: colors.text,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
    },
    eyeIcon: {
      padding: 10,
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
        <StyledButton title="Salvar Alterações" onPress={() => { /* handle password change */ }} />
      </View>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
