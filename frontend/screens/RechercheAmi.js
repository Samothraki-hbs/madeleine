import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RechercheAmi() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(null); // userId en cours d'envoi
  const [message, setMessage] = useState('');

  const handleSearch = async (text) => {
    setSearch(text);
    setMessage('');
    if (text.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.14:3000/users?pseudo=' + encodeURIComponent(text), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setResults(data.users);
      } else {
        setResults([]);
        setMessage(data.error || 'Erreur lors de la recherche');
      }
    } catch (err) {
      setResults([]);
      setMessage('Erreur réseau');
    }
    setLoading(false);
  };

  const sendFriendRequest = async (toUserId) => {
    setSending(toUserId);
    setMessage('');
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.14:3000/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toUserId }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Demande envoyée !');
      } else {
        setMessage(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    }
    setSending(null);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un pseudo..."
        value={search}
        onChangeText={handleSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {loading && <ActivityIndicator style={{ marginVertical: 16 }} />}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <FlatList
        data={results}
        keyExtractor={item => item.userId}
        renderItem={({ item }) => (
          <View style={styles.resultRow}>
            <Text style={styles.pseudo}>{item.pseudo}</Text>
            {item.relation === 'none' ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => sendFriendRequest(item.userId)}
                disabled={sending === item.userId}
              >
                <Text style={styles.buttonText}>{sending === item.userId ? 'Envoi...' : 'Demander en ami'}</Text>
              </TouchableOpacity>
            ) : item.relation === 'friend' ? (
              <Text style={styles.statusText}>Déjà ami</Text>
            ) : item.relation === 'sent' ? (
              <Text style={styles.statusText}>Demande envoyée</Text>
            ) : item.relation === 'received' ? (
              <Text style={styles.statusText}>Cet utilisateur vous a déjà envoyé une demande</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={!loading && search.length > 1 ? <Text style={styles.text}>Aucun résultat</Text> : null}
      />
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
  message: {
    fontSize: 16,
    color: '#ff4d2e',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pseudo: {
    fontSize: 18,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#ff4d2e',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statusText: {
    color: '#888',
    fontSize: 15,
    fontStyle: 'italic',
    marginLeft: 8,
  },
}); 