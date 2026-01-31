
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  type?: 'solid' | 'outline';
  disabled?: boolean;
}

const StyledButton: React.FC<StyledButtonProps> = ({ title, onPress, type = 'solid', disabled }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    buttonContainer: {
      width: '100%',
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 8,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    solidContainer: {
      backgroundColor: colors.primary,
    },
    solidText: {
      color: colors.text,
    },
    outlineContainer: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
    },
    outlineText: {
      color: colors.primary,
    },
    disabledContainer: {
      backgroundColor: colors.disabled,
    },
    disabledText: {
      color: colors.disabledText,
    },
  });

  const containerStyle: ViewStyle[] = [styles.buttonContainer];
  const textStyle: TextStyle[] = [styles.buttonText];

  if (disabled) {
    containerStyle.push(styles.disabledContainer);
    textStyle.push(styles.disabledText);
  } else if (type === 'solid') {
    containerStyle.push(styles.solidContainer);
    textStyle.push(styles.solidText);
  } else {
    containerStyle.push(styles.outlineContainer);
    textStyle.push(styles.outlineText);
  }

  return (
    <TouchableOpacity onPress={onPress} style={containerStyle} disabled={disabled}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default StyledButton;

