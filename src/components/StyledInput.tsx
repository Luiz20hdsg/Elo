import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface StyledInputProps extends TextInputProps {
  icon?: string; // This will now be the *name* of the ionicon
  isPassword?: boolean;
}

const StyledInput: React.FC<StyledInputProps> = ({ icon, isPassword = false, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { colors, theme } = useTheme();

  const iconColor = isFocused ? colors.primary : colors.placeholder;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 16,
      marginVertical: 8,
      borderWidth: 1.5,
      borderColor: isFocused ? colors.primary : 'transparent',
      shadowColor: isFocused ? colors.primary : 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isFocused ? 0.15 : 0,
      shadowRadius: isFocused ? 8 : 0,
      elevation: isFocused ? 3 : 0,
    },
    icon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      height: 52,
      color: colors.text,
      fontSize: 15,
      fontWeight: '400',
    },
    eyeIcon: {
      padding: 6,
    }
  });

  return (
    <View style={styles.container}>
      {icon && <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />}
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
          <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StyledInput;
