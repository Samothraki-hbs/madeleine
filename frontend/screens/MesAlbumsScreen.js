import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NouvelAlbumScreen from './NouvelAlbumScreen';

export default function MesAlbumsScreen() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.38:3000/albums', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setAlbums(data.albums);
      else setAlbums([]);
    } catch (err) {
      setAlbums([]);
    }
    setLoading(false);
  };

  const fetchFriends = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // On récupère les amis (userA = moi, userB = ami)
      const response = await fetch('http://192.168.1.38:3000/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setFriends(data.friends);
      else setFriends([]);
    } catch (err) {
      setFriends([]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAlbums();
    }, [])
  );

  const openModal = async () => {
    setAlbumName('');
    setSelectedFriends([]);
    setError('');
    setModalVisible(true);
    await fetchFriends();
  };

  const createAlbum = async () => {
    if (!albumName || selectedFriends.length === 0) {
      setError('Nom et amis requis');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.38:3000/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: albumName, memberIds: selectedFriends }),
      });
      if (response.ok) {
        const data = await response.json();
        setAlbums(prev => [
          { albumId: data.albumId, name: albumName, members: [...selectedFriends, 'moi'], createdBy: 'moi', createdAt: new Date() },
          ...prev
        ]);
        setModalVisible(false);
        fetchAlbums();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
    setCreating(false);
  };

  const toggleFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Suppression d'un album (retrait de l'utilisateur)
  const handleDeleteAlbum = async (albumId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      // Remplace l'URL par celle de ton backend si besoin
      const response = await fetch(`http://192.168.1.38:3000/albums/${albumId}/leave`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setAlbums(prev => prev.filter(a => a.albumId !== albumId));
      } else {
        Alert.alert('Erreur', "Impossible de quitter l'album.");
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Mes albums</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('NouvelAlbum')}>
          <Ionicons name="folder-open-outline" size={28} color="#222" />
          <Ionicons name="add" size={16} color="#222" style={{ position: 'absolute', right: 2, bottom: 2, backgroundColor: '#fff', borderRadius: 8 }} />
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 32 }} /> : null}
      {/* Liste des albums */}
      {(!loading && (!albums || albums.length === 0)) ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', transform: [{ translateY: -15 }] }}>
          <Text style={{ fontSize: 18, color: '#888', textAlign: 'center', paddingHorizontal: 32 }}>
            Aucun lieu de partage encore...{"\n"}Crée une galerie pour faire éclore les premiers souvenirs.
          </Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={item => item.albumId}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.albumCard}
              onPress={() => navigation.navigate('Album', { albumId: item.albumId, albumName: item.name })}
              onLongPress={() => {
                Alert.alert(
                  'Supprimer cet album ?',
                  "Tu ne pourras plus accéder à cet album. Continuer ?",
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Supprimer', style: 'destructive', onPress: () => handleDeleteAlbum(item.albumId) }
                  ]
                );
              }}
            >
              <View style={styles.albumCardLeft}>
                
                <Text style={styles.albumName}>{item.name}</Text>
                <Text style={styles.albumPhotoCount}>
                  {item.keptCount ? item.keptCount + ' photo' + (item.keptCount > 1 ? 's' : '') : '0 photo'}
                </Text>
              </View>
              <View style={styles.albumCardRight}>
                <Text style={styles.albumLastActivity}>Dernière activité il y a 1 heure</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucun album...</Text> : null}
        />
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
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  albumCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  albumCardLeft: {
    flex: 1,
  },
  albumCardRight: {
    marginLeft: 12,
  },
  albumPhotoCount: {
    fontSize: 18,
    color: '#111',
  },
  albumName: {
    fontSize: 22,
    fontWeight : 'bold',
    color: '#222',
    marginTop: 2,
  },
  albumLastActivity: {
    fontSize: 12,
    color: '#bbb',
    fontWeight: '400',
    bottom : -15,
  },
  empty: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  friend: {
    backgroundColor: '#eee',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  friendSelected: {
    backgroundColor: '#0a7ea4',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  friendText: {
    color: '#222',
    fontSize: 16,
  },
  error: {
    color: '#ff4d2e',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#ff4d2e',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  createText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 