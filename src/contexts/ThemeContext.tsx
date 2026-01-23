import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the structure of our themes
interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  placeholder: string;
  inputBackground: string;
  card: string;
}

// Define the context value
interface ThemeContextData {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  toggleTheme: () => void;
}

// Define the themes
const themes = {
  light: {
    background: '#FFFFFF',
    text: '#121212',
    primary: '#1DB954',
    placeholder: '#A9A9A9',
    inputBackground: '#F0F0F0',
    card: '#F0F0F0',
  },
  dark: {
    background: '#121212',
    text: '#FFFFFF',
    primary: '#1DB954',
    placeholder: '#FFFFFF',
    inputBackground: '#333333',
    card: '#282828',
  },
};

// Create the context
const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

// Create a provider component
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  const colors = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
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
