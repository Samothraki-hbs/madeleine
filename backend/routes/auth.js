// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /signup
router.post('/signup', async (req, res) => {
  const { prenom, pseudo } = req.body;

  if (!prenom || !pseudo) {
    return res.status(400).json({ error: 'Prénom et pseudo requis' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE pseudo = $1', [pseudo]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Pseudo déjà utilisé' });
    }

    await pool.query(
      'INSERT INTO users (prenom, pseudo) VALUES ($1, $2)',
      [prenom, pseudo]
    );

    res.status(201).json({ message: 'Inscription réussie' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
