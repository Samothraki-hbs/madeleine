import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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
      const response = await fetch('http://192.168.0.11:3000/albums', {
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
      const response = await fetch('http://192.168.0.11:3000/friends', {
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
      const response = await fetch('http://192.168.0.11:3000/albums', {
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

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Mes albums</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={openModal}>
          <Ionicons name="folder-open-outline" size={28} color="#222" />
          <Ionicons name="add" size={16} color="#222" style={{ position: 'absolute', right: 2, bottom: 2, backgroundColor: '#fff', borderRadius: 8 }} />
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 32 }} /> : null}
      <FlatList
        data={albums}
        keyExtractor={item => item.albumId}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.albumCard}
            onPress={() => navigation.navigate('Album', { albumId: item.albumId, albumName: item.name })}
          >
            <View style={styles.albumCardLeft}>
              <Text style={styles.albumPhotoCount}>{item.photoCount ? item.photoCount + ' photos' : '0 photo'}</Text>
              <Text style={styles.albumName}>{item.name}</Text>
            </View>
            <View style={styles.albumCardRight}>
              <Text style={styles.albumLastActivity}>Dernière activité il y a 1 heure</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucun album...</Text> : null}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Créer un album partagé</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de l'album"
              value={albumName}
              onChangeText={setAlbumName}
            />
            <Text style={styles.label}>Ajouter des amis :</Text>
            <ScrollView style={{ maxHeight: 150 }}>
              {friends.map(friend => (
                <TouchableOpacity
                  key={friend.userId}
                  style={selectedFriends.includes(friend.userId) ? styles.friendSelected : styles.friend}
                  onPress={() => toggleFriend(friend.userId)}
                >
                  <Text style={styles.friendText}>{friend.pseudo}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={createAlbum} disabled={creating}>
                <Text style={styles.createText}>{creating ? 'Création...' : 'Créer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 32,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  albumName: {
    fontSize: 18,
    color: '#222',
    marginTop: 2,
  },
  albumLastActivity: {
    fontSize: 15,
    color: '#bbb',
    fontWeight: '400',
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