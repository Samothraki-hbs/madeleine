import React, { useRef, useEffect } from 'react';
import { View, FlatList, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function FullScreenPhotoViewer({ route, navigation }) {
  const { photos, startIndex } = route.params;
  const flatListRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: startIndex, animated: false });
    }, 0);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={photos}
        keyExtractor={(item) => item.photoId}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.url }} style={styles.image} />
          </View>
        )}
      />
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <AntDesign name="close" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  imageWrapper: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width,
    height,
    resizeMode: 'contain',
  },
  closeBtn: {
    position: 'absolute',
    top: 70,
    right: 24,
    zIndex: 10,
    color : "black",
  },
});
