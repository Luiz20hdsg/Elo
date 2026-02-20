import React, { useState, useMemo } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface StyledInputProps extends TextInputProps {
  icon?: string; // This will now be the *name* of the ionicon
  isPassword?: boolean;
}

const StyledInput: React.FC<StyledInputProps> = React.memo(({ icon, isPassword = false, style, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { colors } = useTheme();

  const iconColor = colors.placeholder;

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
  }), [colors]);

  return (
    <View style={styles.container}>
      {icon && <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={isPassword && !isPasswordVisible}
        {...props}
      />
      {isPassword && (
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default StyledInput;
