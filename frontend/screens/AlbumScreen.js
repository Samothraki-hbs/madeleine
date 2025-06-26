import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function AlbumScreen({ route }) {
  const { albumId, albumName } = route.params;
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]); // uris locales
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchPhotos();
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
      // result.assets est un tableau d'objets {uri, ...}
      if (result.assets.length > 5) {
        setError('Vous ne pouvez sélectionner que 5 photos maximum.');
        setSelectedImages(result.assets.slice(0, 5));
      } else {
        setSelectedImages(result.assets);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{albumName}</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickImages}>
        <Text style={styles.uploadText}>Ajouter des photos</Text>
      </TouchableOpacity>
      {selectedImages.length > 0 && (
        <ScrollView horizontal style={{ marginVertical: 8 }}>
          {selectedImages.map((img, i) => (
            <Image key={i} source={{ uri: img.uri }} style={styles.selectedThumb} />
          ))}
        </ScrollView>
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
}); 