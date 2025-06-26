//appelé après SignUpNavigator
// MainTab renvoie l'écran screen

import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccueilScreen from '../screens/AccueilScreen';
import MonProfilScreen from '../screens/MonProfilScreen';
import MesAlbumsScreen from '../screens/MesAlbumsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const navigation = useNavigation();
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        return;
      }
      try {
        const response = await fetch('http://192.168.0.14:3000/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) {
          await AsyncStorage.removeItem('token');
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }
      } catch (err) {
        // Erreur réseau : tu peux choisir d'afficher un message ou de rester
      }
    };
    checkToken();
  }, []);
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Activité" component={AccueilScreen} />
      <Tab.Screen name="Mes albums" component={MesAlbumsScreen} />
      <Tab.Screen name="Mon profil" component={MonProfilScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
    </Tab.Navigator>
  );
}
