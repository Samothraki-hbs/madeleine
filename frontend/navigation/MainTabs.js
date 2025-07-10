//appelé après SignUpNavigator
// MainTab renvoie l'écran screen

import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccueilScreen from '../screens/AccueilScreen';
import MonProfilScreen from '../screens/MonProfilScreen';
import MesAlbumsScreen from '../screens/MesAlbumsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import AlbumScreen from '../screens/AlbumScreen';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (!user) {
        // Utilisateur non connecté, redirige vers Welcome
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        return;
      }
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('http://10.17.8.189/me', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (response.status === 401) {
          await auth().signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        }
      } catch (err) {
        // Erreur réseau : tu peux choisir d'afficher un message ou de rester
      }
    });
    return unsubscribe;
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
            return <Ionicons name={focused ? 'time' : 'time-outline'} size={28} color={color} />;
          }
          if (route.name === 'Mes albums') {
            return <Ionicons name={focused ? 'folder-open' : 'folder-open-outline'} size={28} color={color} />;
          }
          if (route.name === 'Mon profil') {
            return <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={28} color={color} />;
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
