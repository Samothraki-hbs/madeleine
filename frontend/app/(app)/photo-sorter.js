import React, { useState, useEffect } from 'react';
import Swiper from 'react-native-deck-swiper';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.65;

export default function PhotoSorter({ photos = [], onSwipe = () => {}, onClose }) {
  const [cardIndex, setCardIndex] = useState(0);

  useEffect(() => {
    if (cardIndex >= photos.length && onClose) onClose();
  }, [cardIndex]);

  const handleSwipe = (direction) => {
    if (photos[cardIndex]) onSwipe(photos[cardIndex], direction);
    if (cardIndex + 1 >= photos.length) {
      if (direction !== 'top' && onClose) onClose();
    } else {
      setCardIndex((idx) => idx + 1);
    }
  };

  if (cardIndex >= photos.length) return null;

  const currentPhoto = photos[cardIndex];
  const pseudo = currentPhoto?.pseudo || "François"; // à adapter dynamiquement

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.uploader}>Déposée par {pseudo}</Text>
        <View style={styles.progressBar}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === cardIndex ? styles.activeDot : {},
              ]}
            />
          ))}
        </View>
      </View>

      {/* Swiper */}
      <View style={styles.cardWrapper}>
        <Swiper
          cards={photos}
          cardIndex={cardIndex}
          renderCard={(photo) => (
            <View style={styles.card}>
              <Image source={{ uri: photo.url }} style={styles.image} />
            </View>
          )}
          onSwipedLeft={() => handleSwipe('left')}
          onSwipedRight={() => handleSwipe('right')}
          onSwipedTop={() => handleSwipe('top')}
          backgroundColor={'transparent'}
          stackSize={1}
          stackSeparation={6}
          disableBottomSwipe
          swipeBackCard
          swipeThreshold={width * 0.3}
          containerStyle={{ backgroundColor: 'transparent' }}
        />
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.circleButton}>
          <Feather name="download" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton}>
          <MaterialCommunityIcons name="trash-can" size={28} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    width : '100%', 
  },
  topBar: {
    width: '100%',
    paddingHorizontal: 20,
  },
  uploader: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  progressBar: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 6,
  },
  progressDot: {
    height: 4,
    flex: 1,
    backgroundColor: 'gray',
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    right : CARD_WIDTH/2 +20, 
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    
  },
  image: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
