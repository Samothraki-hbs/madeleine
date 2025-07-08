import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function SelectionAmisScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const albumName = route.params?.albumName || '';
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.0.20:3000/friends', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setFriends(data.friends);
        else setError(data.error || 'Erreur lors du chargement');
      } catch (err) {
        setError('Erreur réseau');
      }
      setLoading(false);
    };
    fetchFriends();
  }, []);

  const toggle = (userId) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleNext = async () => {
    if (selected.length === 0) {
      setError('Sélectionne au moins un ami');
      return;
    }
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.20:3000/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: albumName, memberIds: selected }),
      });
      if (response.ok) {
        navigation.navigate('MesAlbums');
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création de l\'album');
      }
    } catch (err) {
      setError('Erreur réseau');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendRow}
      onPress={() => toggle(item.userId)}
      disabled={item.disabled}
    >
      <View style={[styles.avatar, item.disabled && { opacity: 0.2 }]} />
      <Text style={[styles.friendName, item.disabled && { color: '#bbb' }]}>{item.pseudo}</Text>
      {!item.disabled && selected.includes(item.userId) && (
        <Ionicons name="checkmark-circle" size={24} color="#111" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nom de l'album</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={friends.map(f => ({ ...f, disabled: false }))}
          keyExtractor={item => item.userId}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24, paddingTop: 32 }}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>Suivant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    marginRight: 18,
  },
  friendName: {
    fontSize: 20,
    flex: 1,
    color: '#111',
  },
  error: {
    color: '#ff4d2e',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
  },
  nextBtn: {
    backgroundColor: '#000',
    borderRadius: 40,
    marginHorizontal: 24,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
}); 