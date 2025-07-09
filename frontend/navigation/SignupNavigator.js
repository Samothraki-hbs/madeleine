// navigation/SignupNavigator.js


// premier truc renvoyé après App.js


import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/signup/WelcomeScreen';
import MailScreen from '../screens/signup/MailScreen';
import PseudoScreen from '../screens/signup/PseudoScreen';
import MainTabs from './MainTabs';
import RechercheAmi from '../screens/RechercheAmi';
import NotificationScreen from '../screens/NotificationScreen';
import AlbumScreen from '../screens/AlbumScreen';
import LoginScreen from '../screens/login/LoginScreen';

const Stack = createNativeStackNavigator();

export default function SignupNavigator() {
  return (
    <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="PseudoScreen" component={PseudoScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="RechercheAmi" component={RechercheAmi} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="Album" component={AlbumScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="MailScreen" component={MailScreen} />
    </Stack.Navigator>
  );
}

