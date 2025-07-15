import React, { useState } from 'react';
import { View, Image, TextInput, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function PublishScreen() {
  const { imageUri } = useLocalSearchParams();
  const [description, setDescription] = useState('');

  const handlePublish = () => {
    // Ici, tu peux uploader l'image et la description à ton backend ou à Firebase Storage
    // Puis naviguer ou afficher un message de succès
    alert('Photo publiée !');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <TextInput
        style={styles.input}
        placeholder="Ajouter une description..."
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Publier" onPress={handlePublish} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: 300, height: 300, marginBottom: 20 },
  input: { width: '80%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 20 },
});
