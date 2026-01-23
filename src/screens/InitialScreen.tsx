import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';

// Define the navigation props for the stack
type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Register: undefined;
};

type InitialScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Initial'
>;

const InitialScreen = () => {
  const navigation = useNavigation<InitialScreenNavigationProp>();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    buttonContainer: {
      paddingHorizontal: 24,
      paddingBottom: 50,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <ImageBackground
      source={require('../assets/images/initial_background.png')}
      resizeMode="cover"
      style={styles.background}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default InitialScreen;
