// le main, ce qui lance tout
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SignupNavigator from './navigation/SignupNavigator';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Notifications } from './firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

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

  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          const userToken = await AsyncStorage.getItem('token');
          if (userToken) {
            await fetch('http://10.17.9.88:3000/users/me/fcm-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({ fcmToken: token }),
            });
          }
        }
      })();
    }
    // Ajout de la vérification du token au démarrage
    (async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
      setLoading(false);
    })();
  }, []);

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