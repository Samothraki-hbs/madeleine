import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import RechercheAmi from '../screens/RechercheAmi';
import NotificationScreen from '../screens/NotificationScreen';
import NouvelAlbumScreen from '../screens/NouvelAlbumScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="RechercheAmi" component={RechercheAmi} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="NouvelAlbum" component={NouvelAlbumScreen} />
    </Stack.Navigator>
  );
} 