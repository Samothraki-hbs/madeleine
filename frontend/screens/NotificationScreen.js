import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // requestId en cours
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.14:3000/friend-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests);
      } else {
        setMessage(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const respond = async (requestId, action) => {
    setActionLoading(requestId + action);
    setMessage('');
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.14:3000/friend-request/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        fetchRequests();
      } else {
        setMessage(data.error || 'Erreur');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    }
    setActionLoading(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {loading ? <ActivityIndicator style={{ marginVertical: 24 }} /> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <FlatList
        data={requests}
        keyExtractor={item => item.requestId}
        renderItem={({ item }) => (
          <View style={styles.requestRow}>
            <Text style={styles.pseudo}>{item.fromPseudo}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#0a7ea4' }]}
                onPress={() => respond(item.requestId, 'accept')}
                disabled={actionLoading === item.requestId + 'accept'}
              >
                <Text style={styles.buttonText}>{actionLoading === item.requestId + 'accept' ? '...' : 'Accepter'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#888' }]}
                onPress={() => respond(item.requestId, 'refuse')}
                disabled={actionLoading === item.requestId + 'refuse'}
              >
                <Text style={styles.buttonText}>{actionLoading === item.requestId + 'refuse' ? '...' : 'Refuser'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucune demande d'ami</Text> : null}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ff4d2e',
    textAlign: 'center',
    marginBottom: 12,
  },
  requestRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pseudo: {
    fontSize: 18,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  empty: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
}); 