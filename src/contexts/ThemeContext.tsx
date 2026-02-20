import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

// Define the structure of our themes
interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  placeholder: string;
  secondaryText: string;
  inputBackground: string;
  card: string;
  cardElevated: string;
  surface: string;
  disabled: string;
  disabledText: string;
  border: string;
  separator: string;
  danger: string;
  dangerLight: string;
  success: string;
  warning: string;
  shadow: string;
  overlay: string;
  gradient1: string;
  gradient2: string;
  tabBar: string;
  tabBarBorder: string;
  messageBubbleMine: string;
  messageBubbleTheirs: string;
  online: string;
}

// Define the context value
interface ThemeContextData {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  toggleTheme: () => void;
}

// Define the themes
const themes: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#FAFAFA',
    text: '#1A1A2E',
    primary: '#1DB954',
    primaryLight: '#1ED760',
    primaryDark: '#169C46',
    secondary: '#6C63FF',
    accent: '#FF6B6B',
    placeholder: '#9E9E9E',
    secondaryText: '#6B7280',
    inputBackground: '#F3F4F6',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    surface: '#F8F9FA',
    disabled: '#E5E7EB',
    disabledText: '#9CA3AF',
    border: '#E8E8E8',
    separator: '#F0F0F0',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    success: '#10B981',
    warning: '#F59E0B',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradient1: '#1DB954',
    gradient2: '#1ED760',
    tabBar: '#FFFFFF',
    tabBarBorder: '#F0F0F0',
    messageBubbleMine: '#1DB954',
    messageBubbleTheirs: '#F0F0F0',
    online: '#34D399',
  },
  dark: {
    background: '#0A0A0F',
    text: '#F1F1F3',
    primary: '#1DB954',
    primaryLight: '#1ED760',
    primaryDark: '#169C46',
    secondary: '#7C73FF',
    accent: '#FF6B6B',
    placeholder: '#6B7280',
    secondaryText: '#9CA3AF',
    inputBackground: '#1A1A2E',
    card: '#16162A',
    cardElevated: '#1E1E36',
    surface: '#12121F',
    disabled: '#374151',
    disabledText: '#6B7280',
    border: '#2A2A40',
    separator: '#1F1F35',
    danger: '#EF4444',
    dangerLight: '#3B1111',
    success: '#10B981',
    warning: '#F59E0B',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    gradient1: '#1DB954',
    gradient2: '#1ED760',
    tabBar: '#0E0E18',
    tabBarBorder: '#1A1A2E',
    messageBubbleMine: '#1DB954',
    messageBubbleTheirs: '#1E1E36',
    online: '#34D399',
  },
};

// Create the context
const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

// Create a provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const colors = themes[theme];

  const value = useMemo(() => ({
    theme,
    colors,
    toggleTheme,
  }), [theme, colors, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create a custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
