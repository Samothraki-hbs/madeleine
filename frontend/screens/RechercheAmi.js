import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

export default function RechercheAmi() {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un pseudo..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.text}>Page de recherche d'amis</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 24,
    paddingTop: 48,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  text: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
}); 