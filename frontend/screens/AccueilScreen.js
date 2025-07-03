import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

export default function AccueilScreen() {
  const navigation = useNavigation();
  const [friendPins, setFriendPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);

  const fetchFriendPins = async () => {
    setLoadingPins(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.11:3000/pins/friends', {
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

  useFocusEffect(
    React.useCallback(() => {
      fetchFriendPins();
    }, [])
  );

  // Replace this with your actual data fetching logic
  const pictures = []; // Empty array means no pictures

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Activité</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={[styles.roundIcon, { backgroundColor: '#000' }]}
            onPress={() => {}}>
            <FontAwesome name="gift" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roundIcon, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' }]}
            onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={friendPins}
        keyExtractor={item => item.pinId}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.avatarCircle}>
                {/* Placeholder avatar blanc */}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>{item.userPseudo || 'Jules'}</Text>
                <Text style={styles.activitySubtitle}>Offert par François</Text>
              </View>
              <Text style={styles.activityTime}>{item.pinnedAt ? 'Il y a 1 heure' : ''}</Text>
            </View>
            <View style={styles.activityImageBox}>
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.activityImage} />
              ) : null}
            </View>
            <View style={styles.activityActions}>
              <Ionicons name="heart-outline" size={24} color="#ddd" style={{ marginRight: 12 }} />
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#ddd" />
            </View>
          </View>
        )}
        ListEmptyComponent={!loadingPins ? <Text style={styles.empty}>Aucune activité</Text> : null}
      />
      {loadingPins && <ActivityIndicator style={{ marginTop: 24 }} />}
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
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  roundIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
    height: 680,
    width: 280,
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
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginRight: 20,
    padding: 16,
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
    height: 220,
    borderRadius: 18,
    marginBottom: 10,
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
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 13,
    color: '#bbb',
    marginLeft: 8,
  },
  activityImageBox: {
    width: '100%',
    aspectRatio: 1.5,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  activityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  activityActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
});
