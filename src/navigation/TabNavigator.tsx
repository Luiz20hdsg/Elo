import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';

import ProfileScreen from '../screens/ProfileScreen';
import PeopleScreen from '../screens/PeopleScreen';
import ChatsScreen from '../screens/ChatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const getTabBarIcon = (route: any, focused: boolean, color: string, size: number) => {
  let iconName: string;

  if (route.name === 'Perfil') {
    iconName = focused ? 'person' : 'person-outline';
  } else if (route.name === 'Pessoas') {
    iconName = focused ? 'heart' : 'heart-outline';
  } else if (route.name === 'Conversas') {
    iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
  } else if (route.name === 'Ajustes') {
    iconName = focused ? 'settings' : 'settings-outline';
  } else {
    iconName = 'help-outline';
  }

  return (
    <View style={focused ? styles.activeIconContainer : undefined}>
      <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  activeIconContainer: {
    paddingTop: 2,
  },
});

const TabNavigator = () => {
  const { colors, theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route, focused, color, size),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: theme === 'dark' ? 0.3 : 0.08,
          shadowRadius: 12,
          elevation: 20,
        },
      })}
    >
      <Tab.Screen name="Perfil" component={ProfileScreen} />
      <Tab.Screen name="Pessoas" component={PeopleScreen} />
      <Tab.Screen name="Conversas" component={ChatsScreen} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
