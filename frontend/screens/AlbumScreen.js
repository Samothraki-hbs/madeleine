import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView, Modal, Dimensions, Animated, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function AlbumScreen({ route }) {
  const { albumId, albumName } = route.params;
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]); // uris locales
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photosToSort, setPhotosToSort] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [currentSortIndex, setCurrentSortIndex] = useState(0);
  const window = Dimensions.get('window');
  const [pan] = useState(new Animated.ValueXY());

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.0.14:3000/albums/${albumId}/photos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setPhotos(data.photos);
      else setPhotos([]);
    } catch (err) {
      setPhotos([]);
    }
    setLoading(false);
  };

  const fetchPhotosToSort = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.0.14:3000/albums/${albumId}/photos-to-sort`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setPhotosToSort(data.photos);
      else setPhotosToSort([]);
    } catch (err) {
      setPhotosToSort([]);
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchPhotosToSort();
  }, []);

  const pickImages = async () => {
    setError('');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 1,
    });
    if (!result.canceled) {
      if (result.assets.length > 5) {
        setError('Vous ne pouvez sélectionner que 5 photos maximum.');
        setSelectedImages(result.assets.slice(0, 5));
      } else {
        setSelectedImages(result.assets);
      }
    }
  };

  const compressIfNeeded = async (asset) => {
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      if (blob.size <= 1024 * 1024) {
        return asset; // <= 1 Mo
      }
      // Compresser jusqu'à obtenir <= 1 Mo
      let quality = 0.8;
      let compressed = asset;
      let compressedBlob = blob;
      while (compressedBlob.size > 1024 * 1024 && quality > 0.1) {
        const manipResult = await ImageManipulator.manipulateAsync(
          asset.uri,
          [],
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );
        const resp = await fetch(manipResult.uri);
        compressedBlob = await resp.blob();
        compressed = { ...asset, uri: manipResult.uri };
        quality -= 0.1;
      }
      return compressed;
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
      for (const asset of selectedImages) {
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
      const response = await fetch(`http://192.168.0.14:3000/albums/${albumId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        setSelectedImages([]);
        fetchPhotos();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'upload');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
    setUploading(false);
  };

  // PanResponder pour le swipe
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20 || Math.abs(gesture.dy) > 20,
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x, dy: pan.y }
    ], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -80) handleSort('archived'); // swipe gauche
      else if (gesture.dx > 80) handleSort('kept'); // swipe droite
      else if (gesture.dy < -80) handleSort('pinned'); // swipe haut
      else Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  });

  const handleSort = async (status) => {
    if (!photosToSort[currentSortIndex]) return;
    const photo = photosToSort[currentSortIndex];
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`http://192.168.0.14:3000/photos/${photo.photoId}/status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId, status }),
      });
    } catch {}
    pan.setValue({ x: 0, y: 0 });
    if (currentSortIndex + 1 < photosToSort.length) {
      setCurrentSortIndex(currentSortIndex + 1);
    } else {
      setSorting(false);
      setPhotosToSort([]);
      fetchPhotos();
      fetchPhotosToSort();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{albumName}</Text>
      {photosToSort.length > 0 && !sorting && (
        <TouchableOpacity style={styles.envelopeBtn} onPress={() => { setSorting(true); setCurrentSortIndex(0); }}>
          <Image source={require('../assets/images/envelope.png')} style={styles.envelopeImg} />
          <Text style={styles.envelopeText}>Nouvelles photos à trier !</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
        <Text style={styles.uploadText}>Ajouter des photos</Text>
      </TouchableOpacity>
      {selectedImages.length > 0 && (
        <>
          <ScrollView horizontal style={{ marginVertical: 8 }}>
            {selectedImages.map((img, i) => (
              <Image key={i} source={{ uri: img.uri }} style={styles.selectedThumb} />
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.uploadBtnSmall} onPress={uploadPhotos} disabled={uploading}>
            <Text style={styles.uploadTextSmall}>{uploading ? 'Envoi...' : 'Envoyer les photos'}</Text>
          </TouchableOpacity>
        </>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.subtitle}>Photos de l'album :</Text>
      {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : null}
      <FlatList
        data={photos}
        keyExtractor={item => item.photoId}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.photoCell}>
            <Image source={{ uri: item.url }} style={styles.photo} />
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucune photo</Text> : null}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      {sorting && photosToSort.length > 0 && photosToSort[currentSortIndex] && (
        <Modal visible transparent animationType="fade">
          <View style={styles.sortOverlay}>
            <Animated.View
              style={[styles.sortCard, { transform: pan.getTranslateTransform() }]}
              {...panResponder.panHandlers}
            >
              <Image source={{ uri: photosToSort[currentSortIndex].url }} style={styles.sortImage} />
              <View style={styles.sortLabels}>
                <Text style={styles.sortLabelLeft}>Archiver
                  {'\n'}⬅️</Text>
                <Text style={styles.sortLabelRight}>Garder
                  {'\n'}➡️</Text>
                <Text style={styles.sortLabelUp}>Epingler
                  {'\n'}⬆️</Text>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  uploadBtn: {
    backgroundColor: '#ff4d2e',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  selectedThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  photoCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  empty: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  error: {
    color: '#ff4d2e',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  uploadBtnSmall: {
    backgroundColor: '#ff4d2e',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  uploadTextSmall: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  envelopeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  envelopeImg: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  envelopeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d2e',
    textAlign: 'center',
  },
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortCard: {
    width: window.width * 0.85,
    height: window.height * 0.7,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  sortImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
    backgroundColor: '#eee',
  },
  sortLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sortLabelLeft: {
    color: '#ff4d2e',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'left',
    flex: 1,
  },
  sortLabelRight: {
    color: '#43a047',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    flex: 1,
  },
  sortLabelUp: {
    color: '#0a7ea4',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
}); 