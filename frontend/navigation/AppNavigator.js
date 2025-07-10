import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import RechercheAmi from '../screens/RechercheAmi';
import NotificationScreen from '../screens/NotificationScreen';
import NouvelAlbumScreen from '../screens/NouvelAlbumScreen';
import SelectionAmisScreen from '../screens/SelectionAmisScreen';
import MesAlbumsScreen from '../screens/MesAlbumsScreen';
import AlbumScreen from '../screens/AlbumScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="RechercheAmi" component={RechercheAmi} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="NouvelAlbum" component={NouvelAlbumScreen} />
      <Stack.Screen name="SelectionAmis" component={SelectionAmisScreen} />
      <Stack.Screen name="Mes Albums" component={MesAlbumsScreen} />
      <Stack.Screen name="Album" component={AlbumScreen} />
    </Stack.Navigator>
  );
} 