/// Welcome Screen

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen({ navigation }) {
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://192.168.0.11:3000/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 401) {
            await AsyncStorage.removeItem('token');
            // Reste sur WelcomeScreen
            return;
          }
          if (response.ok) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          }
        } catch (err) {
          // Erreur réseau, tu peux choisir de rester sur WelcomeScreen ou afficher un message
        }
      }
    };
    checkToken();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue sur Madeleine</Text>
        <Text style={styles.subtitle}>
          Le nouveau réseau social pour partager des nouvelles entre proches !
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Pseudo')}
      >
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // gris clair
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 48,
  },
  content: {
    marginTop: '40%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    backgroundColor: '#ff4d2e',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});
