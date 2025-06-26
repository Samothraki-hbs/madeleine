// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// POST /signup
router.post('/signup', async (req, res) => {
  const { pseudo } = req.body;

  if (!pseudo) {
    return res.status(400).json({ error: 'Pseudo requis' });
  }

  try {
    // Vérifier si le pseudo existe déjà
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('pseudo', '==', pseudo).get();
    if (!snapshot.empty) {
      return res.status(409).json({ error: 'Pseudo déjà utilisé' });
    }

    // Ajouter le nouvel utilisateur
    const userRef = await usersRef.add({ pseudo });
    const userId = userRef.id;
    // Générer un token JWT
    const token = jwt.sign({ userId, pseudo }, 'votre_secret_jwt', { expiresIn: '7d' });
    res.status(201).json({ message: 'Inscription réussie', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Middleware de vérification du JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  jwt.verify(token, 'votre_secret_jwt', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
}

// POST /login
router.post('/login', async (req, res) => {
  const { pseudo } = req.body;
  if (!pseudo) {
    return res.status(400).json({ error: 'Pseudo requis' });
  }
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('pseudo', '==', pseudo).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Pseudo incorrect' });
    }
    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const token = jwt.sign({ userId, pseudo }, 'votre_secret_jwt', { expiresIn: '7d' });
    res.status(200).json({ message: 'Connexion réussie', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Exemple de route protégée
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

