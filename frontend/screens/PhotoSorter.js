import React, { useState } from 'react';
import Swiper from 'react-native-deck-swiper';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function PhotoSorter({ photos = [], onSwipe = () => {}, onClose }) {
  const [cardIndex, setCardIndex] = useState(0);
  if (cardIndex >= photos.length) {
    if (onClose) onClose();
    return null;
  }

  // Carte : 90% largeur, 70% hauteur, centrée
  const CARD_WIDTH = width * 0.9;
  const CARD_HEIGHT = height * 0.7;

  const handleSwipe = (direction) => {
    if (photos[cardIndex]) {
      onSwipe(photos[cardIndex], direction);
    }
    if (cardIndex + 1 >= photos.length) {
      if (onClose) onClose();
    } else {
      setCardIndex(idx => idx + 1);
    }
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={36} color="#fff" />
      </TouchableOpacity>
      <View style={styles.centeredContainer}>
        <Swiper
          cards={photos}
          cardIndex={cardIndex}
          renderCard={(photo) => (
            <View style={styles.cardWrapper}>
              <View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }] }>
                <Image source={{ uri: photo.url }} style={styles.image} />
              </View>
            </View>
          )}
          onSwipedLeft={() => handleSwipe('left')}
          onSwipedRight={() => handleSwipe('right')}
          onSwipedTop={() => handleSwipe('top')}
          backgroundColor={'transparent'}
          stackSize={1}
          stackSeparation={8}
          animateOverlayLabelsOpacity={false}
          disableBottomSwipe
          swipeBackCard
          swipeThreshold={0.35 * width}
          containerStyle={styles.swiperContainer}
          showSecondCard={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 30,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 24,
    padding: 6,
  },
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
    backgroundColor: '#000',
  },
}); 