import React, { useState, useMemo } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface StyledInputProps extends TextInputProps {
  icon?: string; // This will now be the *name* of the ionicon
  isPassword?: boolean;
}

const StyledInput: React.FC<StyledInputProps> = ({ icon, isPassword = false, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { colors, theme } = useTheme();

  const iconColor = isFocused ? colors.primary : colors.placeholder;

  // Static styles – only recreated when the theme changes, NOT on focus change
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 16,
      marginVertical: 8,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    containerFocused: {
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
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
  }), [colors, theme]);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      {icon && <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />}
      <TextInput
        style={[styles.input, style]}
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
