import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const handleLogout = async () => {
    try {
      await auth().signOut();
      router.replace('/(auth)/welcome');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de se déconnecter.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paramètres</Text>
      <Button title="Se déconnecter" onPress={handleLogout} color="#ff4d2e" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
});