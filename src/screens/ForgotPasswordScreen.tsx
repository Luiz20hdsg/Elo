import React, { useState, useEffect, useCallback } from 'react';
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

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { colors, theme, toggleTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);


  const handleAdvance = () => {
    setStep(2);
    setTimer(180);
    setIsTimerRunning(true);
  };

  const handleResend = () => {
    setTimer(180);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            setIsTimerRunning(false);
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning]);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [timer]);

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
    input: {
      backgroundColor: colors.inputBackground,
      color: colors.text,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      marginBottom: 20,
    },
    timerText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
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
        {step === 1 ? (
          <>
            <Text style={styles.title}>Digite seu email:</Text>
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <StyledButton title="Avançar" onPress={handleAdvance} />
          </>
        ) : (
          <>
            <Text style={styles.title}>
              Digite o código enviado para o seu email:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Código de 6 dígitos"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
            {isTimerRunning && <Text style={styles.timerText}>{formatTime()}</Text>}
            <StyledButton
                title="Enviar"
                onPress={() => console.log('enviar')}
                disabled={code.length !== 6}
            />
            {timer === 0 && (
              <StyledButton title="Reenviar código" onPress={handleResend} type="outline"/>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
