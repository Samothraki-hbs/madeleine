import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import SignupNavigator from './navigation/SignupNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <SignupNavigator />
    </NavigationContainer>
  );
}