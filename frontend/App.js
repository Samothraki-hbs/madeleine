// App.js
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import PhoneLoginScreen from './screens/PhoneLoginScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <PhoneLoginScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});
