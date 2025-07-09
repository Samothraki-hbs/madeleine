import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { savePseudo } from '../../firebase/firebaseAuth';

export default function PseudoScreen({ navigation }) {
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (pseudo.length < 3) {
      setError('Le pseudo doit faire au moins 3 caractères');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await savePseudo(pseudo);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement du pseudo');
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
      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
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
