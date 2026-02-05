import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import StyledButton from '../components/StyledButton';
import StyledInput from '../components/StyledInput';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';

type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { colors, theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  // O ideal é tratar a data com um DatePicker, mas para simplificar usamos texto.
  const [birthDate, setBirthDate] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !username || !birthDate) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    
    const { data: { user }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erro no cadastro', error.message);
      setLoading(false);
      return;
    }

    if (user) {
      // O trigger já criou um profile básico. Agora atualizamos com os dados adicionais.
      // Note que o username na tabela 'profiles' é o que será usado no app, não o email.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username: username,
          // full_name pode ser preenchido depois, no perfil.
          // a data de nascimento também precisaria de uma coluna 'birth_date' na tabela.
        })
        .eq('id', user.id);

      if (profileError) {
        Alert.alert('Erro ao criar perfil', profileError.message);
        // Aqui, você pode querer deletar o usuário recém-criado para evitar inconsistência.
        // await supabase.auth.api.deleteUser(user.id);
      } else {
        Alert.alert(
          'Cadastro realizado!',
          'Um email de confirmação foi enviado. Por favor, verifique sua caixa de entrada.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    }
    
    setLoading(false);
  };

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
    logo: {
      fontSize: 48,
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 20,
      fontStyle: 'italic',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.placeholder,
      textAlign: 'center',
      marginBottom: 40,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    buttonContainer: {
      marginTop: 20,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity
            onPress={() => navigation.navigate('Login')} 
            style={{ padding: 10, marginLeft: -10 }}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
          <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.logo}>elo</Text>
        <Text style={styles.subtitle}>
          Crie sua conta.
        </Text>

        <Text style={styles.title}>Cadastro</Text>

        <StyledInput
          icon="👤"
          placeholder="Nome de usuário"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <StyledInput
          icon="✉️"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <StyledInput
          icon="🎂"
          placeholder="Data de nascimento (DD/MM/AAAA)"
          autoCapitalize="none"
          value={birthDate}
          onChangeText={setBirthDate}
        />

        <StyledInput 
          icon="🔒" 
          placeholder="Senha" 
          isPassword={true} 
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.buttonContainer}>
          <StyledButton
            title={loading ? 'Cadastrando...' : 'Cadastrar'}
            onPress={handleSignUp}
            disabled={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;
