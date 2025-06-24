import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { loginWithPhoneNumber } from '../firebase/firebaseAuth';

export default function PhoneLoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState('');

  const handleSendCode = async () => {
    try {
      const result = await loginWithPhoneNumber(phoneNumber);
      setConfirmationResult(result);
      setCodeSent(true);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleConfirmCode = async () => {
    try {
      await confirmationResult.confirm(otp);
      Alert.alert('Succès', 'Connexion réussie !');
      // 🔜 ici, on redirigera vers l'inscription complète ou la page d’accueil
    } catch (error) {
      Alert.alert('Erreur', 'Code incorrect ou expiré.');
    }
  };

  return (
    <View style={styles.container}>
      <View id="recaptcha-container" /> {/* Obligatoire pour Firebase Web */}
      <Text style={styles.title}>Connexion par téléphone</Text>

      {!codeSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="+33 6 12 34 56 78"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <Button title="Envoyer le code" onPress={handleSendCode} />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Code reçu par SMS"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
          <Button title="Valider le code" onPress={handleConfirmCode} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    padding: 12,
    borderRadius: 6,
  },
});
