import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CIRCLE_SIZE = 220;
const SCREEN_WIDTH = Dimensions.get('window').width;

const pdpAssets = [
  require('/Users/arthurdevilliers/Madeleine/frontend/assets/images/standard_pdp/madeleinePdP1.jpg'),
  require('/Users/arthurdevilliers/Madeleine/frontend/assets/images/standard_pdp/madeleinePdP2.jpg'),
  require('/Users/arthurdevilliers/Madeleine/frontend/assets/images/standard_pdp/madeleinePdP3.jpg'),
  require('/Users/arthurdevilliers/Madeleine/frontend/assets/images/standard_pdp/madeleinePdP4.jpg'),
  require('/Users/arthurdevilliers/Madeleine/frontend/assets/images/standard_pdp/madeleinePdP5.jpg'),
  require('/Users/arthurdevilliers/Madeleine/frontend/assets/images/standard_pdp/madeleinePdP6.jpg'),
];

export default function ChooseProfilePhotoScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [scale] = useState(new Animated.Value(1));
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastOffset = useRef({ x: 0, y: 0 }).current;
  const [standardPhotos, setStandardPhotos] = useState([]);

  useEffect(() => {
    const loadAssets = async () => {
      const assets = await Promise.all(pdpAssets.map(asset => Asset.fromModule(asset).downloadAsync()));
      const uris = assets.map(asset => asset.localUri || asset.uri);
      setStandardPhotos(uris);
      setImage(uris[0]);
    };
    loadAssets();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      position.setOffset({ x: lastOffset.x, y: lastOffset.y });
      position.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event([
      null,
      { dx: position.x, dy: position.y },
    ], { useNativeDriver: false }),
    onPanResponderRelease: () => {
      position.flattenOffset();
      lastOffset.x = position.x._value;
      lastOffset.y = position.y._value;
    },
  });

  const handleSelectStandard = (uri, index) => {
    setImage(uri);
    setSelectedIndex(index);
    setModalVisible(false);
  };
  
  const handleNext = async () => {
    if (standardIndex !== null) {
      await saveStandardProfilePhoto(standardIndex);
    }
    
  };

  

  const saveStandardProfilePhoto = async (standardIndex) => {
    navigation.replace('AddFriends');
    const token = await AsyncStorage.getItem('token');
    await fetch('http://192.168.1.38:3000/users/me/profile-photo-standard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ standardIndex }),
      
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisis ta photo de profil</Text>

      <View style={styles.avatarCircle}>
        <Image source={{ uri: image }} style={styles.avatarImage} />
      </View>

      <ScrollView horizontal contentContainerStyle={styles.miniaturesRow}>
        {standardPhotos.filter(uri => uri !== image).map((uri, index) => (
        <TouchableOpacity key={index} onPress={() => handleSelectStandard(uri, index)}>
          <Image source={{ uri }} style={styles.miniature} />
        </TouchableOpacity>
))}
      </ScrollView>

      <TouchableOpacity style={styles.validateBtn} onPress={() => saveStandardProfilePhoto(selectedIndex)}
        disabled={selectedIndex === null}
      >
        <Text style={styles.validateText}>Suivant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    paddingTop: 80,
  },
  title: {
    marginTop : 30,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111',
  },
  avatarCircle: {

    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#eee',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarImage: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  validateBtn: {
    backgroundColor: '#ff4d2e',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom : 100,
    
  },
  validateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  miniaturesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  miniature: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 4,
  },
});