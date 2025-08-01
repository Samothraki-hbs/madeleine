import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function AddFriendsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajoute des amis</Text>
      <Text style={styles.subtitle}>Pour profiter pleinement de Madeleine, invite tes proches à te rejoindre !</Text>
      <TouchableOpacity style={styles.addBtn} onPress={() => {/* à brancher plus tard */}}>
        <Text style={styles.addBtnText}>Rechercher / Ajouter des amis</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('MainTabs')}>
        <Text style={styles.skipBtnText}>Passer cette étape</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#111',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 40,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#111',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginBottom: 24,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  skipBtn: {
    marginTop: 12,
  },
  skipBtnText: {
    color: '#ff4d2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 