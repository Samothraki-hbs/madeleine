import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Notifications from 'expo-notifications';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Récupère le profil Firestore
        const doc = await firestore().collection('users').doc(user.uid).get();
        setProfile(doc.exists ? doc.data() : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return; // Attend que l'état de chargement soit terminé

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    // Si l'utilisateur n'est pas connecté, on le redirige vers l'auth
    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
      return;
    }

    // Si l'utilisateur est connecté et le profil chargé, on le redirige vers l'activité
    if (user && profile !== null) {
      if (!inAppGroup) {
        router.replace('/(app)/(tabs)/activite');
      }
    }
  }, [user, profile, segments, loading]);

  useEffect(() => {
    // Configuration des notifications
    const configurePushNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permission refusée pour les notifications');
        return;
      }

      // Enregistrer le token pour Firebase
      if (user) {
        const token = await Notifications.getExpoPushTokenAsync();
        // Envoyer le token à votre backend
        console.log('Token de notification:', token);
      }
    };

    configurePushNotifications();
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff4d2e" />
      </View>
    );
  }

  return <Slot />;
} 