import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AlbumScreen({ route }) {
  const { albumId, albumName } = route.params;
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [urls, setUrls] = useState(['']);
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

  const addPhotoField = () => setUrls([...urls, '']);
  const setUrl = (i, val) => setUrls(urls.map((u, idx) => idx === i ? val : u));
  const removePhotoField = (i) => setUrls(urls.filter((_, idx) => idx !== i));

  const uploadPhotos = async () => {
    setError('');
    const validUrls = urls.map(u => u.trim()).filter(Boolean);
    if (validUrls.length === 0) {
      setError('Ajoute au moins une URL');
      return;
    }
    setAdding(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.0.14:3000/albums/${albumId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ urls: validUrls }),
      });
      if (response.ok) {
        setUrls(['']);
        fetchPhotos();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
    setAdding(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{albumName}</Text>
      <Text style={styles.subtitle}>Ajouter des photos (URL) :</Text>
      <ScrollView horizontal style={{ marginBottom: 8 }}>
        {urls.map((url, i) => (
          <View key={i} style={styles.urlRow}>
            <TextInput
              style={styles.input}
              placeholder="URL de la photo"
              value={url}
              onChangeText={val => setUrl(i, val)}
            />
            {urls.length > 1 && (
              <TouchableOpacity onPress={() => removePhotoField(i)} style={styles.removeBtn}>
                <Text style={{ color: '#fff' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={addPhotoField} style={styles.addBtn}>
          <Text style={{ color: '#fff', fontSize: 22 }}>+</Text>
        </TouchableOpacity>
      </ScrollView>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.uploadBtn} onPress={uploadPhotos} disabled={adding}>
        <Text style={styles.uploadText}>{adding ? 'Ajout...' : 'Ajouter les photos'}</Text>
      </TouchableOpacity>
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
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    minWidth: 180,
  },
  addBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  removeBtn: {
    backgroundColor: '#ff4d2e',
    borderRadius: 20,
    padding: 8,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  uploadBtn: {
    backgroundColor: '#ff4d2e',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
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