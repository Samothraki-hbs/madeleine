import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function AccueilScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activité</Text>
        <View style={styles.icons}>
          <View style={styles.circleIcon}><Text>🔔</Text></View>
          <View style={styles.circleIcon}><Text>📤</Text></View>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Image source={{ uri: 'https://placehold.co/48x48' }} style={styles.avatar} />
        <View>
          <Text style={styles.username}>Armand</Text>
          <Text style={styles.time}>il y a 1 heure</Text>
        </View>
      </View>

      <View style={styles.placeholderImage}>
        <Text style={styles.placeholderText}>[ image partagée ici ]</Text>
      </View>

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
  },
  placeholderText: {
    fontSize: 16,
    color: '#555',
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
});
