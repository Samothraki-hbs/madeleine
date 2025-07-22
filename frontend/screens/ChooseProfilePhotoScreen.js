import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Dimensions, Animated, PanResponder, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';

const CIRCLE_SIZE = 320;
const SCREEN_WIDTH = Dimensions.get('window').width;

const standardImages = [
  require('../assets/images/standard_pdp/madeleinePdP1.jpg'),
  require('../assets/images/standard_pdp/madeleinePdP2.jpg'),
  require('../assets/images/standard_pdp/madeleinePdP3.jpg'),
  require('../assets/images/standard_pdp/madeleinePdP4.jpg'),
  require('../assets/images/standard_pdp/madeleinePdP5.jpg'),
  require('../assets/images/standard_pdp/madeleinePdP6.jpg'),
];

export default function ChooseProfilePhotoScreen({ navigation }) {
  const [image, setImage] = useState(null); // URI d'une photo perso
  const [standardIndex, setStandardIndex] = useState(0); // Par défaut, photo standard 1
  const [modalVisible, setModalVisible] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null); // image recadrée et zoomée

  // Pour le crop/zoom
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastPosition = useRef({ x: 0, y: 0 });
  const baseDistance = useRef(null);

  // PanResponder pour drag + pinch
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gestureState) => {
      position.setOffset({ x: lastPosition.current.x, y: lastPosition.current.y });
      position.setValue({ x: 0, y: 0 });
      scale.setOffset(lastScale.current);
      scale.setValue(1);
      if (gestureState.numberActiveTouches === 2) {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          baseDistance.current = Math.sqrt(dx * dx + dy * dy);
        }
      }
    },
    onPanResponderMove: (e, gestureState) => {
      if (gestureState.numberActiveTouches === 2) {
        const touches = e.nativeEvent.touches;
        if (touches.length === 2 && baseDistance.current) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          let scaleFactor = distance / baseDistance.current;
          let newScale = Math.max(1, Math.min(lastScale.current * scaleFactor, 3));
          scale.setValue(newScale / lastScale.current);
        }
      } else if (gestureState.numberActiveTouches === 1) {
        let dx = gestureState.dx;
        let dy = gestureState.dy;
        dx = Math.max(Math.min(dx, CIRCLE_SIZE / 2), -CIRCLE_SIZE / 2);
        dy = Math.max(Math.min(dy, CIRCLE_SIZE / 2), -CIRCLE_SIZE / 2);
        position.setValue({ x: dx, y: dy });
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.numberActiveTouches < 2) {
        let dx = gestureState.dx;
        let dy = gestureState.dy;
        dx = Math.max(Math.min(lastPosition.current.x + dx, CIRCLE_SIZE / 2), -CIRCLE_SIZE / 2);
        dy = Math.max(Math.min(lastPosition.current.y + dy, CIRCLE_SIZE / 2), -CIRCLE_SIZE / 2);
        lastPosition.current = { x: dx, y: dy };
        position.setOffset({ x: dx, y: dy });
        position.setValue({ x: 0, y: 0 });
      }
      if (gestureState.numberActiveTouches === 2) {
        lastScale.current = Math.max(1, Math.min(lastScale.current * scale.__getValue(), 3));
        scale.setValue(1);
        scale.setOffset(lastScale.current);
        baseDistance.current = null;
      }
    },
    onPanResponderTerminationRequest: () => false,
  })).current;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      setTempImage(result.assets[0].uri);
      setModalVisible(true);
      setStandardIndex(null); // désélectionne la photo standard
    }
  };

  // Affichage du modal de crop/zoom
  const handleCrop = async () => {
    if (!tempImage) return;
    const scaleValue = lastScale.current * scale.__getValue();
    const pos = {
      x: lastPosition.current.x + position.x.__getValue(),
      y: lastPosition.current.y + position.y.__getValue(),
    };
    const manipResult = await ImageManipulator.manipulateAsync(
      tempImage,
      [
        { crop: { originX: 0, originY: 0, width: 900, height: 900 } },
        { resize: { width: 400, height: 400 } },
      ],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImage(manipResult.uri);
    setFinalImage(manipResult.uri);
    setModalVisible(false);
    setStandardIndex(null);
    lastScale.current = 1;
    lastPosition.current = { x: 0, y: 0 };
    scale.setValue(1);
    position.setValue({ x: 0, y: 0 });
  };

  const handleValidate = () => {
    navigation.replace('AddFriends');
  };

  // Détermine la photo à afficher dans le cercle
  let displayImage = null;
  if (standardIndex !== null) {
    displayImage = standardImages[standardIndex];
  } else if (image) {
    displayImage = { uri: image };
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisis ta photo de profil</Text>
      <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
        <View style={styles.avatarCircle}>
          {displayImage ? (
            <Image source={displayImage} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={CIRCLE_SIZE} color="#bbb" />
          )}
          <View style={styles.editIconBox}>
            <Ionicons name="camera" size={28} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
      {/* Galerie de photos standard */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 28 }} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
        {standardImages.map((img, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.standardMini, standardIndex === idx && styles.standardMiniActive]}
            onPress={() => {
              setStandardIndex(idx);
              setImage(null); // désélectionne la photo perso
              setFinalImage(null);
            }}
            activeOpacity={0.8}
          >
            <Image source={img} style={styles.standardMiniImg} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.validateBtn} onPress={handleValidate} disabled={displayImage === null}>
        <Text style={styles.validateText}>Valider</Text>
      </TouchableOpacity>
      {/* Modal crop/zoom pour photo perso */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.cropContainer}>
            <View style={styles.cropCircleBg} />
            {tempImage && (
              <Animated.View
                style={{
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { scale: Animated.multiply(scale, lastScale.current) },
                  ],
                }}
                {...panResponder.panHandlers}
              >
                <Image source={{ uri: tempImage }} style={styles.cropImage} resizeMode="cover" />
              </Animated.View>
            )}
            <View style={styles.cropCircle} pointerEvents="none" />
            <TouchableOpacity style={styles.cropBtn} onPress={handleCrop}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Valider</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 32,
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
    position: 'relative',
  },
  avatarImage: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  editIconBox: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#111',
    borderRadius: 18,
    padding: 4,
  },
  validateBtn: {
    backgroundColor: '#ff4d2e',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 32,
    alignItems: 'center',
  },
  validateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropContainer: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    backgroundColor: '#222',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cropCircleBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 24,
    zIndex: 1,
  },
  cropImage: {
    width: CIRCLE_SIZE + 180,
    height: CIRCLE_SIZE + 180,
    borderRadius: (CIRCLE_SIZE + 180) / 2,
  },
  cropCircle: {
    position: 'absolute',
    top: (SCREEN_WIDTH - 32 - CIRCLE_SIZE) / 2,
    left: (SCREEN_WIDTH - 32 - CIRCLE_SIZE) / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 10,
  },
  cropBtn: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#ff4d2e',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
  },
  standardMini: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    marginHorizontal: 7,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardMiniActive: {
    borderColor: '#ff4d2e',
  },
  standardMiniImg: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    resizeMode: 'cover',
  },
}); 