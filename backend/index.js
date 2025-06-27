// index.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // ← ton fichier de routes
require('dotenv').config(); // ← pour lire le fichier .env
const { bucket } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // autorise Thunder Client à se connecter
app.use(express.json()); // autorise req.body en JSON

// Routes
app.use('/', authRoutes); // ← toutes les routes définies dans routes/auth.js

// Test de connexion à Firebase Storage
app.get('/test-storage', async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ maxResults: 1 });
    res.json({ success: true, files: files.map(f => f.name) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});

