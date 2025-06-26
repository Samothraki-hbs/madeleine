//appelé après SignUpNavigator
// MainTab renvoie l'écran screen

import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccueilScreen from '../screens/AccueilScreen';
import MonProfilScreen from '../screens/MonProfilScreen';
import MesAlbumsScreen from '../screens/MesAlbumsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import AlbumScreen from '../screens/AlbumScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

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
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ff4d2e',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 70,
          paddingBottom: 10,
          marginHorizontal: 0,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Activité') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />;
          }
          if (route.name === 'Mes albums') {
            return <MaterialIcons name={focused ? 'photo-album' : 'photo-album'} size={28} color={color} />;
          }
          if (route.name === 'Mon profil') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={28} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Activité" component={AccueilScreen} />
      <Tab.Screen name="Mes albums" component={MesAlbumsScreen} />
      <Tab.Screen name="Mon profil" component={MonProfilScreen} />
    </Tab.Navigator>
  );
}
