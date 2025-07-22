import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions, FlatList, Text, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');
const MINIATURE_SIZE = 60;

export default function PreviewSelectedPhotosScreen({ route, navigation }) {
  const [images, setImages] = useState(route.params?.images || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const albumId = route.params?.albumId;
  const onUploadSuccess = route.params?.onUploadSuccess;

  const removeImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
    if (selectedIndex >= newImages.length) setSelectedIndex(Math.max(0, newImages.length - 1));
    if (newImages.length === 0) navigation.goBack();
  };

  const compressIfNeeded = async (asset) => {
    try {
      // Redimensionne à 1280px de large max et compresse à 0.6
      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1280 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );
      return { ...asset, uri: manipResult.uri };
    } catch (e) {
      return asset;
    }
  };

  const uploadPhotos = async () => {
    setError('');
    setUploading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      // Compresser si besoin
      const compressedImages = [];
      for (const asset of images) {
        compressedImages.push(await compressIfNeeded(asset));
      }
      const formData = new FormData();
      compressedImages.forEach((img, i) => {
        formData.append('photos', {
          uri: img.uri,
          name: `photo_${Date.now()}_${i}.jpg`,
          type: 'image/jpeg',
        });
      });
      const response = await fetch(`http://192.168.1.44:3000/albums/${albumId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        if (onUploadSuccess) onUploadSuccess();
        navigation.goBack();
      } else {
        let data = {};
        try {
          data = await response.json();
        } catch (e) {
          data.error = "Erreur lors de l'upload (réponse inattendue du serveur)";
        }
        setError(data.error || "Erreur lors de l'upload");
      }
    } catch (err) {
      setError('Erreur réseau ou serveur injoignable');
    }
    setUploading(false);
  };

  return (
    <View style={styles.container}>
      {/* Bouton Annuler en haut à gauche */}
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={uploading}>
        <Text style={styles.cancelText}>Annuler</Text>
      </TouchableOpacity>
      {/* Photo sélectionnée en grand */}
      {images[selectedIndex] && (
        <Image source={{ uri: images[selectedIndex].uri }} style={styles.mainImage} />
      )}
      {/* Barre de miniatures et bouton flèche côte à côte */}
      <View style={styles.bottomBar}>
        <FlatList
          data={images}
          horizontal
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={styles.miniaturesList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              key={index}
              style={[styles.miniatureBox, index === selectedIndex && styles.miniatureBoxActive]}
              onPress={() => setSelectedIndex(index)}
              activeOpacity={0.7}
              disabled={uploading}
            >
              <Image source={{ uri: item.uri }} style={styles.miniatureImage} />
              {index === selectedIndex && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(index)} disabled={uploading}>
                  <AntDesign name="delete" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        />
        {/* Flèche orange en bas à droite, alignée */}
        <View style={styles.sendBtnWrapper}>
          <TouchableOpacity style={styles.sendBtn} onPress={uploadPhotos} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AntDesign name="arrowright" size={32} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: width,
    height: height * 0.7,
    resizeMode: 'contain',
    marginTop: 40,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    zIndex: 200,
  },
  miniaturesList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingVertical: 0,
  },
  miniatureBox: {
    width: MINIATURE_SIZE,
    height: MINIATURE_SIZE,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginHorizontal: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  miniatureBoxActive: {
    borderWidth: 2,
    borderColor: '#ff4d2e',
  },
  miniatureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: 'transparent',
  },
  deleteBtn: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#bbb',
    borderRadius: 12,
    padding: 2,
    zIndex: 10,
  },
  sendBtnWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: MINIATURE_SIZE,
    marginLeft: 8,
  },
  sendBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff4d2e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelBtn: {
    position: 'absolute',
    top: 36,
    left: 18,
    zIndex: 100,
    padding: 8,
  },
  cancelText: {
    color: '#ff4d2e',
    fontSize: 20,
    fontWeight: 'bold',
  },
  error: {
    color: '#ff4d2e',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
}); 