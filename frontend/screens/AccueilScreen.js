import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth'
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
const CARD_WIDTH = 380 + 10;
const { width : SCREEN_WIDTH } = Dimensions.get('window');

export default function AccueilScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [friendPins, setFriendPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(true);
  const [likesState, setLikesState] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchFriendPins = async () => {
    setLoadingPins(true);
    try {
      const user = auth().currentUser;
      if (!user) {
        setFriendPins([]);
        setLoadingPins(false);
        return;
      }
      const idToken = await user.getIdToken();
      const response = await fetch('http://192.168.239.12:3000/pins/friends', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await response.json();
      if (response.ok) setFriendPins(data.pins);
      else setFriendPins([]);
    } catch (err) {
      setFriendPins([]);
    }
    setLoadingPins(false);
  };
  

  const toggleLike = (pinId) => {
    setLikesState((prev) => ({
      ...prev,
      [pinId]: !prev[pinId],
    }));
  };

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / CARD_WIDTH);
    setCurrentIndex(newIndex);
    flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
  };

  useFocusEffect(
    useCallback(() => {
      fetchFriendPins();
    }, [])
  );

  // Replace this with your actual data fetching logic
  const pictures = []; // Empty array means no pictures

  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission refusée !");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!pickerResult.canceled) {
      // Navigue vers PublishScreen avec l'image sélectionnée
      navigation.navigate('PublishScreen', { imageUri: pickerResult.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Activité</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={[styles.roundIcon, { backgroundColor: '#ff4d2e' }]}
            onPress={openImagePicker}>
            <FontAwesome name="trophy" size={24} color="#white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roundIcon, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' }]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#222" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={friendPins}
        keyExtractor={(item) => item.pinId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 }}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => {
          const liked = likesState[item.pinId] || false;
          return (
            <View style={styles.activityCard}>
              <View style={styles.activityImageBox}>
                {item.photoUrl && (
                  <Image source={{ uri: item.photoUrl }} style={styles.activityImage} />
                )}
                <TouchableOpacity
                  style={styles.heartIcon}
                  onPress={() => toggleLike(item.pinId)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <AntDesign
                    name={liked ? 'heart' : 'hearto'}
                    size={36}
                    color={liked ? '#ff4d4d' : '#fff'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !loadingPins ? <Text style={styles.empty}>Aucune activité</Text> : null
        }
      />

      {/* Loader */}
      {loadingPins && <ActivityIndicator style={{ marginTop: 24 }} />}
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
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  roundIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  placeholderImage: {
    height: 680,
    width: 280,
    backgroundColor: '#d1d5db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  realImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    gap: 24,
  },
  actionIcon: {
    fontSize: 22,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
  },
  pinCard: {
    width: 320,
    backgroundColor: 'red',
    borderRadius: 24,
    marginRight: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  empty: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
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
  activityCard: {
    width: 380,
    height: 400,
    backgroundColor: 'transparent',
    marginLeft : 6,
    borderRadius: 18,
    marginBottom: 0,
    paddingTop: 15,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginRight : 10,
    position : 'relative',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 13,
    color: '#bbb',
    marginLeft: 8,
  },
  activityImageBox: {
    paddingTop : 100,
    width: '100%',
    aspectRatio :2/3,
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityImage: {
    width : "100%",
    height : '400',
    resizeMode: 'cover',
    borderRadius : 12,
    
  },
  activityActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 0,
  },
  heartIcon: {
    position: 'absolute',
    bottom: 70,
    right: 5,
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 6,
  },
});
