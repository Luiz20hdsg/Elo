import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

import ProfileScreen from '../screens/ProfileScreen';
import PeopleScreen from '../screens/PeopleScreen';
import ChatsScreen from '../screens/ChatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
  let iconName: string;

  if (routeName === 'Profile') {
    iconName = focused ? 'person' : 'person-outline';
  } else if (routeName === 'People') {
    iconName = focused ? 'heart' : 'heart-outline';
  } else if (routeName === 'Chats') {
    iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
  } else if (routeName === 'Settings') {
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
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route.name, focused, color, size),
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
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabs.profile') }} />
      <Tab.Screen name="People" component={PeopleScreen} options={{ tabBarLabel: t('tabs.people') }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ tabBarLabel: t('tabs.chats') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('tabs.settings') }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
