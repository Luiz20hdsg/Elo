import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface StyledInputProps extends TextInputProps {
  icon?: string;
  isPassword?: boolean;
}

const StyledInput: React.FC<StyledInputProps> = ({ icon, isPassword = false, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      paddingHorizontal: 15,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: colors.inputBackground,
    },
    containerFocused: {
      borderColor: colors.primary,
    },
    icon: {
      fontSize: 20,
      color: colors.placeholder,
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      color: colors.text,
      fontSize: 16,
    },
    eyeIcon: {
      padding: 5,
    }
  });

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={isPassword && !isPasswordVisible}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={colors.placeholder} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StyledInput;
