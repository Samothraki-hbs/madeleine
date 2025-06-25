import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MonProfilScreen({ navigation }) {
  const pseudo = 'Armand'; // Hardcoded for now
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
}); 