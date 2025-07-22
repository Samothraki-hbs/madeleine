import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MonProfilScreen({ navigation }) {
  const [pseudo, setPseudo] = useState('');
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState(null);
  const [tab, setTab] = useState('pins'); // 'pins' ou 'archives'
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [sending, setSending] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.40:3000/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.user && data.user.pseudo) {
        setPseudo(data.user.pseudo);
      }
    } catch (err) {
      // ignore
    }
  };

  const fetchPins = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.40:3000/pins/me', {
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

  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.40:3000/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.friends) setFriends(data.friends);
      else setFriends([]);
    } catch (err) {
      setFriends([]);
    }
    setLoadingFriends(false);
  };

  const handleSearch = async (text) => {
    setSearch(text);
    setSearchMessage('');
    if (text.length < 2) {
      setResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.40:3000/users?pseudo=' + encodeURIComponent(text), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setResults(data.users);
      } else {
        setResults([]);
        setSearchMessage(data.error || 'Erreur lors de la recherche');
      }
    } catch (err) {
      setResults([]);
      setSearchMessage('Erreur réseau');
    }
    setLoadingSearch(false);
  };

  const sendFriendRequest = async (toUserId) => {
    setSending(toUserId);
    setSearchMessage('');
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.40:3000/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ toUserId }),
      });
      const data = await response.json();
      if (response.ok) {
        setSearchMessage('Demande envoyée !');
      } else {
        setSearchMessage(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      setSearchMessage('Erreur réseau');
    }
    setSending(null);
  };

  // Helper pour savoir si on peut envoyer une demande
  const canSendRequest = (item) => item.relation === 'none' && sending !== item.userId;

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }], // ← ou le nom exact de ton écran de login
        });
        return;
      }
      fetchUser();
      fetchPins();
      fetchFriends();
    };
  
    checkAuth();
  }, []);
  // Pour la grille d'archives : 12 cases vides (exemple)
  const archiveGrid = Array.from({ length: 12 });

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <TouchableOpacity onPress={() => navigation.navigate('ChooseProfilePhoto')} activeOpacity={0.8}>
          <Image style={styles.avatar} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: -5, marginTop : 30 }}>
          <Text style={styles.headerTitle}>{pseudo}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => navigation.navigate('Settings')}><Ionicons name="settings-outline" size={22} color="#111" /></TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => setShowFriendsModal(true)}><Ionicons name="people-outline" size={22} color="#111" /></TouchableOpacity>
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
          {(!loading && (!pins || pins.length === 0)) ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', transform: [{ translateY: -15 }] }}>
              <Text style={{ fontSize: 18, color: '#888', textAlign: 'center', paddingHorizontal: 32 }}>
                Aucune photo épinglée. La mémoire est patiente, les souvenirs viendront.
              </Text>
            </View>
          ) : (
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
              ListEmptyComponent={null}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}
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
      {/* Modal Mes proches */}
      <Modal visible={showFriendsModal} transparent animationType="fade" onRequestClose={() => setShowFriendsModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowFriendsModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={{ backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 48, minWidth: 320, maxWidth: 340, minHeight: 480, maxHeight: 600, alignItems: 'center', justifyContent: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 }}>
                  {showSearch ? (
                    <TouchableOpacity onPress={() => setShowSearch(false)} style={{ marginRight: 12 }}>
                      <Ionicons name="arrow-back" size={26} color="#111" />
                    </TouchableOpacity>
                  ) : null}
                  <Text style={{ fontSize: 22, fontWeight: 'bold', flex: 1 }}>{showSearch ? 'Ajouter un ami' : 'Mes proches'}</Text>
                  {!showSearch && (
                    <TouchableOpacity onPress={() => setShowSearch(true)}>
                      <Ionicons name="person-add" size={26} color="#111" />
                    </TouchableOpacity>
                  )}
                </View>
                {showSearch ? (
                  <View style={{ width: '100%' }}>
                    <TextInput
                      style={{
                        height: 40,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 20,
                        paddingHorizontal: 16,
                        backgroundColor: '#fff',
                        marginBottom: 16,
                      }}
                      placeholder="Rechercher un pseudo..."
                      value={search}
                      onChangeText={handleSearch}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {loadingSearch && <ActivityIndicator style={{ marginVertical: 16 }} />}
                    {searchMessage ? <Text style={{ color: '#ff4d2e', fontSize: 15, textAlign: 'center', marginBottom: 8 }}>{searchMessage}</Text> : null}
                    <FlatList
                      data={results}
                      keyExtractor={item => item.userId}
                      renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f7f7f7', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                          <Text style={{ fontSize: 17 }}>{item.pseudo}</Text>
                          {canSendRequest(item) ? (
                            <TouchableOpacity
                              style={{ backgroundColor: '#ff4d2e', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 }}
                              onPress={() => sendFriendRequest(item.userId)}
                              disabled={sending === item.userId}
                            >
                              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{sending === item.userId ? 'Envoi...' : 'Demander en ami'}</Text>
                            </TouchableOpacity>
                          ) : item.relation === 'friend' ? (
                            <Text style={{ color: '#888', fontSize: 15, fontStyle: 'italic', marginLeft: 8 }}>Déjà ami</Text>
                          ) : item.relation === 'sent' ? (
                            <Text style={{ color: '#888', fontSize: 15, fontStyle: 'italic', marginLeft: 8 }}>Demande envoyée</Text>
                          ) : item.relation === 'received' ? (
                            <Text style={{ color: '#888', fontSize: 15, fontStyle: 'italic', marginLeft: 8 }}>Cet utilisateur vous a déjà envoyé une demande</Text>
                          ) : null}
                        </View>
                      )}
                      ListEmptyComponent={!loadingSearch && search.length > 1 ? <Text style={{ fontSize: 16, color: '#888', textAlign: 'center' }}>Aucun résultat</Text> : null}
                      style={{ maxHeight: 220 }}
                    />
                  </View>
                ) : loadingFriends ? (
                  <ActivityIndicator style={{ marginVertical: 16 }} />
                ) : friends.length === 0 ? (
                  <Text style={{ color: '#888', fontSize: 16, marginVertical: 16 }}>Aucun ami</Text>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {friends.map((f, i) => (
                      <View key={f.userId} style={{ alignItems: 'center', margin: 10, width: 70 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#eee', marginBottom: 4, justifyContent: 'center', alignItems: 'center' }}>
                          {/* Avatar placeholder, tu peux mettre une initiale ou une image plus tard */}
                        </View>
                        <Text style={{ fontSize: 15, textAlign: 'center' }}>{f.pseudo}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    backgroundColor: 'transparent',
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