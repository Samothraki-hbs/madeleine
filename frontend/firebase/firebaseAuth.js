// firebaseAuth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "./firebaseConfig";

const auth = getAuth(app);
const db = getFirestore(app);

// Inscription
export const registerWithEmail = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Enregistrement du pseudo
export const savePseudo = async (pseudo) => {
  const user = auth.currentUser;
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    pseudo: pseudo,
    createdAt: new Date()
  });
};

// Connexion
export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Déconnexion
export const logout = async () => {
  return await signOut(auth);
};