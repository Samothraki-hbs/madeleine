// navigation/SignupNavigator.js


// premier truc renvoyé après App.js


import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/signup/WelcomeScreen';
import PseudoScreen from '../screens/signup/PseudoScreen';
import MainTabs from './MainTabs';
import RechercheAmi from '../screens/RechercheAmi';



const Stack = createNativeStackNavigator();

export default function SignupNavigator() {
  return (
    <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Pseudo" component={PseudoScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="RechercheAmi" component={RechercheAmi} />
    </Stack.Navigator>
  );
}

