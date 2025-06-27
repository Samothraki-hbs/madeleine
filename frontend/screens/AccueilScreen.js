import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function AccueilScreen() {
  const navigation = useNavigation();
  const [friendPins, setFriendPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);

  const fetchFriendPins = async () => {
    setLoadingPins(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.14:3000/pins/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setFriendPins(data.pins);
      else setFriendPins([]);
    } catch (err) {
      setFriendPins([]);
    }
    setLoadingPins(false);
  };

  useEffect(() => {
    fetchFriendPins();
  }, []);

  // Replace this with your actual data fetching logic
  const pictures = []; // Empty array means no pictures

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activité</Text>
        <View style={styles.icons}>
          <TouchableOpacity style={styles.circleIcon} onPress={() => navigation.navigate('Notifications')}>
            <Image source={require('../assets/images/notification.png')} style={styles.notifIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Carrousel horizontal des épingles amis */}
      <Text style={styles.carouselTitle}>Epingles de mes amis</Text>
      {loadingPins ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
      <FlatList
        data={friendPins}
        keyExtractor={item => item.pinId}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ paddingLeft: 8, paddingRight: 8 }}
        renderItem={({ item }) => (
          <View style={styles.pinCard}>
            <View style={styles.pinHeader}>
              <Image source={{ uri: item.userAvatar || 'https://ui-avatars.com/api/?name=Friend' }} style={styles.avatar} />
              <Text style={styles.pinPseudo}>{item.userPseudo || 'Ami'}</Text>
              <Text style={styles.pinDate}>{item.pinnedAt ? new Date(item.pinnedAt._seconds ? item.pinnedAt._seconds * 1000 : item.pinnedAt).toLocaleDateString() : ''}</Text>
            </View>
            <Image source={{ uri: item.photoUrl || '' }} style={styles.pinPhoto} />
            <View style={styles.pinActions}>
              <Text style={styles.actionIcon}>🤍</Text>
              <Text style={styles.actionIcon}>💬</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={!loadingPins ? <Text style={styles.empty}>Aucune épingle d'ami</Text> : null}
      />

      {/* Modal pour afficher la photo en grand */}
      <Modal visible={!!selectedPin} transparent animationType="fade" onRequestClose={() => setSelectedPin(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedPin(null)}>
            <Ionicons name="close" size={36} color="#fff" />
          </TouchableOpacity>
          {selectedPin && (
            <Image
              source={{ uri: selectedPin.photoUrl }}
              style={styles.fullImage}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icons: {
    flexDirection: 'row',
    gap: 16,
  },
  circleIcon: {
    backgroundColor: '#ff4d2e',
    borderRadius: 20,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  placeholderImage: {
    height: 280,
    backgroundColor: '#d1d5db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  realImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    gap: 24,
  },
  actionIcon: {
    fontSize: 22,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  notifIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 8,
  },
  pinCard: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginRight: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  pinPseudo: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    color: '#222',
  },
  pinDate: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  pinPhoto: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  pinActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    gap: 24,
  },
  empty: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModal: {
    position: 'absolute',
    top: 40,
    right: 30,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 24,
    padding: 6,
  },
  fullImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 18,
    backgroundColor: '#222',
  },
});
