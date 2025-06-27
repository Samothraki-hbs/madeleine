const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Charger la clé de service
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

// Initialiser Firebase avec Firestore + Storage
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'madeleine-ad45a.firebasestorage.app'
});

// 🔥 Connexion à Firestore
const db = admin.firestore();

// 🔥 Connexion au bucket Storage
const bucket = admin.storage().bucket();

module.exports = db;
module.exports.admin = admin;
module.exports.bucket = bucket;
