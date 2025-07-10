// madeleine/frontend/firebase/firebaseAuth.js

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Inscription
export const registerWithEmail = async (email, password) => {
  return await auth().createUserWithEmailAndPassword(email, password);
};

// Connexion
export const loginWithEmail = async (email, password) => {
  return await auth().signInWithEmailAndPassword(email, password);
};

// Déconnexion
export const logout = async () => {
  return await auth().signOut();
};

// Enregistrement du pseudo
export const savePseudo = async (pseudo) => {
  const user = auth().currentUser;
  await firestore().collection('users').doc(user.uid).set({
    email: user.email,
    pseudo: pseudo,
    createdAt: new Date()
  });
};