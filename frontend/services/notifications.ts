import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';

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

export class NotificationService {
  static async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
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

      token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // À remplacer par votre ID de projet
      });
    } else {
      console.log('Notifications non supportées sur l\'émulateur');
    }

    return token;
  }

  static async sendTokenToServer(token: string) {
    try {
      const user = auth().currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      const response = await fetch('http://192.168.239.12:3000/notifications/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ token: token.data }),
      });

      if (response.ok) {
        console.log('Token de notification enregistré');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error);
    }
  }

  static async handleNotificationReceived(notification: Notifications.Notification) {
    console.log('Notification reçue:', notification);
    
    // Gérer les deep links selon le type de notification
    const data = notification.request.content.data;
    
    if (data?.type === 'album_share') {
      // Ouvrir l'album partagé
      // router.push(`/(app)/album?id=${data.albumId}`);
    } else if (data?.type === 'friend_request') {
      // Ouvrir les notifications
      // router.push('/(app)/notifications');
    }
  }

  static async handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    // Gérer les actions sur les notifications
    if (data?.type === 'album_share') {
      // router.push(`/(app)/album?id=${data.albumId}`);
    } else if (data?.type === 'friend_request') {
      // router.push('/(app)/notifications');
    }
  }
} 