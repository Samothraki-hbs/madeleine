import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView, Modal, Dimensions, Animated, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import PhotoSorter from './PhotoSorter';
import { IconSymbol } from '../components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

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
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.0.11:3000/albums/${albumId}/photos`, {
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
      const response = await fetch(`http://192.168.0.11:3000/albums/${albumId}/photos-to-sort`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setPhotosToSort(data.photos);
      else setPhotosToSort([]);
    } catch (err) {
      setPhotosToSort([]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPhotos();
      fetchPhotosToSort();
    }, [albumId])
  );

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
      const response = await fetch(`http://192.168.0.11:3000/albums/${albumId}/photos`, {
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
      if (status === 'pinned') {
        await fetch(`http://192.168.0.11:3000/photos/${photo.photoId}/pin`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ albumId }),
        });
      } else {
        await fetch(`http://192.168.0.11:3000/photos/${photo.photoId}/status`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ albumId, status }),
        });
      }
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

  // Animation header
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -120],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedHeader, { transform: [{ translateY: headerTranslateY }], opacity: headerOpacity }]}> 
        <View style={styles.headerContent}>
          <View style={styles.albumTitleContainer}>
            <Text style={styles.albumTitle}>{albumName}</Text>
          </View>
          <View style={styles.addPhotoIconContainer}>
            <TouchableOpacity style={styles.addPhotoIconBox} onPress={pickImages}>
              <IconSymbol name="paperplane.fill" size={40} color="#888" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Photos de l'album :</Text>
        </View>
      </Animated.View>
      {photosToSort.length > 0 && !sorting && (
        <TouchableOpacity style={styles.envelopeBtn} onPress={() => { setSorting(true); setCurrentSortIndex(0); }}>
          <Image source={require('../assets/images/envelope.png')} style={styles.envelopeImg} />
          <Text style={styles.envelopeText}>Nouvelles photos à trier !</Text>
        </TouchableOpacity>
      )}
      {selectedImages.length > 0 && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll} contentContainerStyle={{ alignItems: 'center', paddingVertical: 8 }}>
            {selectedImages.map((img, i) => (
              <View key={i} style={styles.selectedLargeThumbContainer}>
                <Image source={{ uri: img.uri }} style={styles.selectedLargeThumb} />
                <TouchableOpacity style={styles.removeIcon} onPress={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))}>
                  <MaterialIcons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <TouchableOpacity style={styles.uploadBtnLarge} onPress={uploadPhotos} disabled={uploading}>
              <Text style={styles.uploadTextLarge}>{uploading ? 'Envoi...' : 'Envoyer les photos'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : null}
      <Animated.FlatList
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
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
      {sorting && photosToSort.length > 0 && (
        <Modal visible={sorting} transparent animationType="fade">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,1)' }}>
            <PhotoSorter
              photos={photosToSort}
              onSwipe={async (photo, direction) => {
                let status = 'kept';
                if (direction === 'left') status = 'archived';
                if (direction === 'right') status = 'kept';
                const token = await AsyncStorage.getItem('token');
                if (direction === 'top') {
                  await fetch(`http://192.168.0.11:3000/photos/${photo.photoId}/pin`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ albumId }),
                  });
                } else {
                  await fetch(`http://192.168.0.11:3000/photos/${photo.photoId}/status`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ albumId, status }),
                  });
                }
                if (direction === 'right' || direction === 'top') {
                  setPhotos(prev => [...prev, photo]);
                }
                setPhotosToSort(prev => prev.filter(p => p.photoId !== photo.photoId));
              }}
              onClose={() => {
                setSorting(false);
                fetchPhotos();
                fetchPhotosToSort();
              }}
            />
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
    padding: 0,
    paddingTop: 15,
  },
  animatedHeader: {
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 12,
    paddingTop: 8,
    paddingHorizontal: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginHorizontal: 24,
    marginTop: 16,
  },
  albumTitleContainer: {
    marginTop: 10,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: '#f7f7f7',
    overflow: 'hidden',
  },
  addPhotoIconContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  addPhotoIconBox: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedScroll: {
    minHeight: 180,
    maxHeight: 220,
    marginBottom: 8,
  },
  selectedLargeThumbContainer: {
    width: 210,
    height: 210,
    marginRight: 18,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#f3f3f3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedLargeThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  removeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4d2e',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadBtnLarge: {
    backgroundColor: '#ff4d2e',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 38,
    alignItems: 'center',
    marginTop: 0,
    shadowColor: '#ff4d2e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadTextLarge: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  uploadBtn: {
    backgroundColor: '#ff4d2e',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
    shadowColor: '#ff4d2e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  selectedThumb: {
    width: 70,
    height: 70,
    borderRadius: 14,
    marginRight: 10,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#ff4d2e22',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  photoCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  empty: {
    fontSize: 18,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 60,
    fontWeight: '500',
  },
  error: {
    color: '#ff4d2e',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  uploadBtnSmall: {
    backgroundColor: '#ff4d2e',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#ff4d2e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  uploadTextSmall: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginTop: 8,
  },
}); 