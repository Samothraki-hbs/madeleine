import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export class SharingService {
  static async shareAlbum(albumId: string, albumName: string) {
    const shareUrl = `madeleine://album/${albumId}`;
    const webUrl = `https://votre-domaine.com/album/${albumId}`;
    
    const shareMessage = `Regarde cet album "${albumName}" sur Madeleine ! ${shareUrl}`;
    
    if (Platform.OS === 'web') {
      // Copier le lien dans le presse-papiers
      await navigator.clipboard.writeText(shareMessage);
      return;
    }
    
    try {
      await Sharing.shareAsync(shareMessage, {
        mimeType: 'text/plain',
        dialogTitle: `Partager l'album "${albumName}"`,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  }

  static async sharePhoto(photoId: string, photoUrl: string, description?: string) {
    const shareUrl = `madeleine://photo/${photoId}`;
    const webUrl = `https://votre-domaine.com/photo/${photoId}`;
    
    const shareMessage = description 
      ? `${description}\n\nVoir sur Madeleine : ${shareUrl}`
      : `Regarde cette photo sur Madeleine ! ${shareUrl}`;
    
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(shareMessage);
      return;
    }
    
    try {
      await Sharing.shareAsync(shareMessage, {
        mimeType: 'text/plain',
        dialogTitle: 'Partager cette photo',
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  }

  static async shareProfile(userId: string, pseudo: string) {
    const shareUrl = `madeleine://profile/${userId}`;
    const webUrl = `https://votre-domaine.com/profile/${userId}`;
    
    const shareMessage = `Découvre le profil de ${pseudo} sur Madeleine ! ${shareUrl}`;
    
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(shareMessage);
      return;
    }
    
    try {
      await Sharing.shareAsync(shareMessage, {
        mimeType: 'text/plain',
        dialogTitle: `Partager le profil de ${pseudo}`,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  }

  static generateDeepLink(type: 'album' | 'photo' | 'profile', id: string) {
    return `madeleine://${type}/${id}`;
  }

  static generateWebLink(type: 'album' | 'photo' | 'profile', id: string) {
    return `https://votre-domaine.com/${type}/${id}`;
  }
} 