import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AccueilScreen() {
  const navigation = useNavigation();
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
          <View style={styles.circleIcon}><Text>📤</Text></View>
        </View>
      </View>

      {pictures.length === 0 ? (
        <View style={styles.placeholderImage}>
          <Image
            source={{ uri: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fassets.afcdn.com%2Frecipe%2F20191024%2F101123_w2048h1536c1cx1920cy2880.jpg&f=1&nofb=1&ipt=a1d14cc23bf60003ff9aae3c694677c756fd2a01a053c977c896dee27c98de72' }}
            style={styles.realImage}
            resizeMode="cover"
          />
        </View>
      ) : (
        <FlatList
          data={pictures}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Image source={{ uri: item.url }} style={styles.realImage} />
          )}
        />
      )}

      <View style={styles.actions}>
        <Text style={styles.actionIcon}>🤍</Text>
        <Text style={styles.actionIcon}>💬</Text>
      </View>
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
});
