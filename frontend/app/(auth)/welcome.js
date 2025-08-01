/// Welcome Screen

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  useEffect(() => {
    const checkToken = async () => {
      const user = auth().currentUser;
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('http://192.168.0.50:3000/me', {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (response.status === 401) {
            await auth().signOut();
            // Reste sur WelcomeScreen
            return;
          }
          if (response.ok) {
            router.replace('/(app)/(tabs)/activite');
          }
        } catch (err) {
          setError('Impossible de contacter le serveur. Vérifie ta connexion.');
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
        {error ? <Text style={{ color: 'red', marginTop: 16 }}>{error}</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(auth)/mail')}
      >
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { marginTop: 16 }]}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.buttonText}>Connexion</Text>
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
