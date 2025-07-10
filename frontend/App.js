// le main, ce qui lance tout
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SignupNavigator from './navigation/SignupNavigator';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Notifications } from './firebase/firebaseConfig';
import { Platform } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import auth from '@react-native-firebase/auth';

function registerForPushNotificationsAsync() {
  return new Promise(async (resolve, reject) => {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return resolve(null);
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    resolve(token);
  });
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setFcmToken(token);
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        setIsAuthenticated(true);
        setLoading(false);
        // Récupérer le token d'auth Firebase
        const idToken = await user.getIdToken();
        // Si tu veux envoyer le fcmToken à ton backend, fais-le ici
        if (idToken && fcmToken) {
          await fetch('http://192.168.0.20:3000/users/me/fcm-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ fcmToken }),
          });
        }
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [fcmToken]);

  if (loading) return null; // ou un splash screen

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <AppNavigator /> : <SignupNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export function WelcomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenu sur Madeleine</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});