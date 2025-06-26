import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PseudoScreen({ navigation }) {
  const [pseudo, setPseudo] = useState('');

  const handleContinue = async () => {
    if (pseudo.length < 3) {
      alert('Le pseudo doit faire au moins 3 caractères');
      return;
    }
    try {
      const response = await fetch('http://192.168.0.14:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        await AsyncStorage.setItem('token', data.token);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        alert(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choisis ton pseudo</Text>
      <TextInput
        value={pseudo}
        onChangeText={setPseudo}
        placeholder="ex. Armand33"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Commencer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 24,
    justifyContent: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#ff4d2e',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});
