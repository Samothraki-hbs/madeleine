//appelé après SignUpNavigator
// MainTab renvoie l'écran screen

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccueilScreen from '../screens/AccueilScreen';
import MonProfilScreen from '../screens/MonProfilScreen';
import MesAlbumsScreen from '../screens/MesAlbumsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Activité" component={AccueilScreen} />
      <Tab.Screen name="Mes albums" component={MesAlbumsScreen} />
      <Tab.Screen name="Mon profil" component={MonProfilScreen} />
    </Tab.Navigator>
  );
}
