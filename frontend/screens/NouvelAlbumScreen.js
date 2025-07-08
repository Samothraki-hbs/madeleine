import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NouvelAlbumScreen() {
  const navigation = useNavigation();
  const [albumName, setAlbumName] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!albumName.trim()) {
      setError("Le nom de l'album est requis");
      return;
    }
    setError('');
    navigation.navigate('SelectionAmis', { albumName });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvel album</Text>
        </View>
        <View style={styles.centerZone}>
          <TextInput
            style={styles.input}
            placeholder="Nom de l'album"
            value={albumName}
            onChangeText={setAlbumName}
            placeholderTextColor="#888"
            textAlign="center"
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Suivant</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    padding: 12,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    marginLeft: 12,
  },
  centerZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontSize: 32,
    fontWeight: '600',
    color: '#111',
    borderBottomWidth: 1,
    borderColor: '#eee',
    width: '80%',
    marginBottom: 12,
    paddingVertical: 8,
  },
  error: {
    color: '#ff4d2e',
    fontSize: 16,
    marginTop: 8,
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