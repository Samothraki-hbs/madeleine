const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// POST /signup
router.post('/signup', async (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE pseudo = $1', [pseudo]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Pseudo déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (pseudo, password) VALUES ($1, $2)', [pseudo, hashedPassword]);

    res.status(201).json({ message: 'Inscription réussie' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
