
import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  type?: 'solid' | 'outline';
  disabled?: boolean;
  size?: 'default' | 'small';
}

const StyledButton: React.FC<StyledButtonProps> = ({ title, onPress, type = 'solid', disabled, size = 'default' }) => {
  const { colors, theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const isSmall = size === 'small';

  const styles = StyleSheet.create({
    buttonContainer: {
      width: '100%',
      paddingVertical: isSmall ? 12 : 16,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 6,
    },
    buttonText: {
      fontSize: isSmall ? 14 : 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    solidContainer: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    solidText: {
      color: '#FFFFFF',
    },
    outlineContainer: {
      borderWidth: 1.5,
      borderColor: theme === 'dark' ? colors.border : colors.primary,
      backgroundColor: 'transparent',
    },
    outlineText: {
      color: theme === 'dark' ? colors.text : colors.primary,
    },
    disabledContainer: {
      backgroundColor: colors.disabled,
      shadowOpacity: 0,
      elevation: 0,
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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        style={containerStyle}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={textStyle}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default StyledButton;
