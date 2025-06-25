import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MesAlbumsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Encore aucun album... rien de quoi surcharger votre pellicule !
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 24,
  },
  text: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
}); 