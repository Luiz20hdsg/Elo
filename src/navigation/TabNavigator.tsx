import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';

import ProfileScreen from '../screens/ProfileScreen';
import PeopleScreen from '../screens/PeopleScreen';
import ChatsScreen from '../screens/ChatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const getTabBarIcon = (route: any, focused: boolean) => {
  let iconName;

  if (route.name === 'Perfil') {
    iconName = focused ? 'person' : 'person-outline';
  } else if (route.name === 'Pessoas') {
    iconName = focused ? 'people' : 'people-outline';
  } else if (route.name === 'Conversas') {
    iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
  } else if (route.name === 'Ajustes') {
    iconName = focused ? 'settings' : 'settings-outline';
  }

  return iconName;
};

const screenOptions = (colors: any, route: any) => ({
  headerShown: false,
  tabBarIcon: ({ focused, color, size }: { focused: boolean, color: string, size: number }) => {
    const iconName = getTabBarIcon(route, focused);
    return <Ionicons name={iconName} size={size} color={color} />;
  },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: 'gray',
  tabBarStyle: { backgroundColor: colors.background },
});

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => screenOptions(colors, route)}
    >
      <Tab.Screen name="Perfil" component={ProfileScreen} />
      <Tab.Screen name="Pessoas" component={PeopleScreen} />
      <Tab.Screen name="Conversas" component={ChatsScreen} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
