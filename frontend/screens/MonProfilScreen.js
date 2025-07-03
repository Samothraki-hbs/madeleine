import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Modal } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MonProfilScreen({ navigation }) {
  const pseudo = 'Arthur'; // Hardcoded for now
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);
  const [tab, setTab] = useState('pins'); // 'pins' ou 'archives'

  const fetchPins = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.0.11:3000/pins/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setPins(data.pins);
      else setPins([]);
    } catch (err) {
      setPins([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPins();
  }, []);

  // Pour la grille d'archives : 12 cases vides (exemple)
  const archiveGrid = Array.from({ length: 12 });

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Image style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 18 }}>
          <Text style={styles.headerTitle}>{pseudo}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn}><Ionicons name="stats-chart" size={22} color="#111" /></TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}><Ionicons name="settings-outline" size={22} color="#111" /></TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => navigation.navigate('RechercheAmi')}><Ionicons name="people-outline" size={22} color="#111" /></TouchableOpacity>
        </View>
      </View>
      <View style={styles.tabsRow}>
        <TouchableOpacity style={tab === 'pins' ? styles.tabBtnActive : styles.tabBtnInactive} onPress={() => setTab('pins')}>
          <Text style={tab === 'pins' ? styles.tabBtnActiveText : styles.tabBtnInactiveText}>Mes épingles</Text>
          {tab === 'pins' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity style={tab === 'archives' ? styles.tabBtnActive : styles.tabBtnInactive} onPress={() => setTab('archives')}>
          <Text style={tab === 'archives' ? styles.tabBtnActiveText : styles.tabBtnInactiveText}>Mes archives</Text>
          {tab === 'archives' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>
      {tab === 'pins' ? (
        <View style={styles.pinsZone}>
          {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : null}
          <FlatList
            data={pins}
            keyExtractor={item => item.pinId}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gridCell}
                onPress={() => setSelectedPin(item)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.url || item.photoUrl }}
                  style={styles.pinImage}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucune épingle</Text> : null}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </View>
      ) : (
        <FlatList
          data={archiveGrid}
          keyExtractor={(_, i) => 'archive-' + i}
          numColumns={3}
          renderItem={() => (
            <View style={styles.gridCellEmpty} />
          )}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        />
      )}
      {/* Modal pour afficher la photo en grand */}
      <Modal visible={!!selectedPin} transparent animationType="fade" onRequestClose={() => setSelectedPin(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedPin(null)}>
            <Ionicons name="close" size={36} color="#fff" />
          </TouchableOpacity>
          {selectedPin && (
            <Image
              source={{ uri: selectedPin.url || selectedPin.photoUrl }}
              style={styles.fullImage}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 0,
    paddingTop: 15,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#111',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 18,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 0,
  },
  headerActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabBtnActive: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabBtnInactive: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabBtnActiveText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  tabBtnInactiveText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bbb',
  },
  tabUnderline: {
    height: 4,
    backgroundColor: '#111',
    width: '80%',
    borderRadius: 2,
    marginTop: 2,
  },
  pinsZone: {
    width: '100%',
    borderRadius: 0,
    padding: 0,
    marginTop: 0,
    marginBottom: 0,
    alignItems: 'stretch',
    minHeight: 120,
  },
  pinCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    maxWidth: 180,
  },
  pinImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  empty: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModal: {
    position: 'absolute',
    top: 40,
    right: 30,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 24,
    padding: 6,
  },
  fullImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 18,
    backgroundColor: '#222',
  },
  gridCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: '#eee',
  },
  gridCellEmpty: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#111',
    minWidth: 100,
    maxWidth: 180,
  },
}); 