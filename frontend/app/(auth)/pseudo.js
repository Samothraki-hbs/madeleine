import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { savePseudo } from '../../firebase/firebaseAuth';
import auth from '@react-native-firebase/auth'; // ou import { auth } from 'firebase' selon ton setup
import { router } from 'expo-router';
import firestore from '@react-native-firebase/firestore';

export default function PseudoScreen() {
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handlePseudo = async () => {
    setError('');
    setLoading(true);
    try {
      let user = auth().currentUser;
      if (!user) {
        // Attendre un peu et réessayer
        await new Promise(resolve => setTimeout(resolve, 500));
        user = auth().currentUser;
      }
      if (!user) {
        setError('Utilisateur non connecté. Veuillez réessayer dans quelques secondes.');
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch('http://192.168.0.50:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          pseudo, // récupéré depuis le formulaire
        }),
      });

      if (!response.ok && response.status !== 409) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'inscription backend');
      }
      console.log("test réussi ?")
      // Après la requête backend réussie
      // Redirection vers l'app principale après inscription réussie
      router.replace('/activite');
      console.log("test réussi 2 ?")

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        autoCapitalize="none"
      />
      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handlePseudo} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Commencer</Text>}
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
