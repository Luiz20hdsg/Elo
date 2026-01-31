import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from './src/screens/LoginScreen';
import InitialScreen from './src/screens/InitialScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TabNavigator from './src/navigation/TabNavigator';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import PhotoTipsScreen from './src/screens/PhotoTipsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';

import { ThemeProvider } from './src/contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Initial">
            <Stack.Screen
              name="Initial"
              component={InitialScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RegisterScreen"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SummaryScreen"
              component={SummaryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="PhotoTips"
              component={PhotoTipsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChatDetail"
              component={ChatDetailScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
