import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MonProfilScreen({ navigation }) {
  const pseudo = 'Armand'; // Hardcoded for now
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPins = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.14:3000/pins/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setPins(data.pins);
      else setPins([]);
    } catch (err) {
      setPins([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPins();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.pseudo}>{pseudo}</Text>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('RechercheAmi')}
      >
        <Ionicons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.text}>
        Vous n'avez vraiment pas d'amis ? Ajoutez-en à partir de votre page de profil !
      </Text>
      <Text style={styles.sectionTitle}>Mes épingles</Text>
      {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : null}
      <FlatList
        data={pins}
        keyExtractor={item => item.pinId}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.pinCell}>
            <Image source={{ uri: item.photoId ? `https://storage.googleapis.com/madeleine-ad45a.firebasestorage.app/${item.photoId}` : '' }} style={styles.pinImage} />
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucune épingle</Text> : null}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 24,
    paddingTop: 48,
  },
  pseudo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    marginTop: 8,
  },
  iconButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: '#ff4d2e',
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginTop: 32,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  pinCell: {
    width: 90,
    height: 90,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  empty: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
  },
}); 