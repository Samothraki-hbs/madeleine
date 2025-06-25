import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccueilScreen from '../screens/AccueilScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Activité" component={AccueilScreen} />
      <Tab.Screen name="Mes albums" component={() => <></>} />
      <Tab.Screen name="Mon profil" component={() => <></>} />
    </Tab.Navigator>
  );
}
