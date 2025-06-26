// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');

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
    await usersRef.add({ pseudo });
    res.status(201).json({ message: 'Inscription réussie' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

