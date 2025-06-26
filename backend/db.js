const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Remplace le chemin ci-dessous par le chemin réel de ta clé de service Firebase
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;
