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
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }
    res.json({ user: { userId, ...userDoc.data() } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Rechercher des utilisateurs par pseudo (hors soi-même)
router.get('/users', authenticateToken, async (req, res) => {
  const { pseudo } = req.query;
  if (!pseudo || pseudo.length < 1) {
    return res.status(400).json({ error: 'Pseudo requis' });
  }
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .where('pseudo', '>=', pseudo)
      .where('pseudo', '<=', pseudo + '\uf8ff')
      .get();
    const currentUserId = req.user.userId;
    const results = await Promise.all(snapshot.docs
      .filter(doc => doc.id !== currentUserId)
      .map(async doc => {
        const userId = doc.id;
        const userPseudo = doc.data().pseudo;
        // Vérifier la relation
        let relation = 'none';
        // Ami ?
        const friendsRef = db.collection('friends');
        const isFriend = !(await friendsRef.where('userA', '==', currentUserId).where('userB', '==', userId).get()).empty
          || !(await friendsRef.where('userA', '==', userId).where('userB', '==', currentUserId).get()).empty;
        if (isFriend) relation = 'friend';
        // Demande envoyée ?
        const requestsRef = db.collection('friendRequests');
        const sent = !(await requestsRef.where('fromUserId', '==', currentUserId).where('toUserId', '==', userId).where('status', '==', 'pending').get()).empty;
        if (sent) relation = 'sent';
        // Demande reçue ?
        const received = !(await requestsRef.where('fromUserId', '==', userId).where('toUserId', '==', currentUserId).where('status', '==', 'pending').get()).empty;
        if (received) relation = 'received';
        return { userId, pseudo: userPseudo, relation };
      }));
    res.json({ users: results });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Envoyer une demande d'ami
router.post('/friend-request', authenticateToken, async (req, res) => {
  const { toUserId } = req.body;
  const fromUserId = req.user.userId;
  if (!toUserId || toUserId === fromUserId) {
    return res.status(400).json({ error: 'Utilisateur cible invalide' });
  }
  try {
    // 1. Vérifier si déjà amis (dans les deux sens)
    const friendsRef = db.collection('friends');
    const friendsSnapshot = await friendsRef
      .where('userA', '==', fromUserId)
      .where('userB', '==', toUserId)
      .get();
    if (!friendsSnapshot.empty) {
      return res.status(409).json({ error: 'Vous êtes déjà amis' });
    }
    const friendsSnapshot2 = await friendsRef
      .where('userA', '==', toUserId)
      .where('userB', '==', fromUserId)
      .get();
    if (!friendsSnapshot2.empty) {
      return res.status(409).json({ error: 'Vous êtes déjà amis' });
    }
    // 2. Vérifier si une demande existe déjà dans un sens ou dans l'autre
    const requestsRef = db.collection('friendRequests');
    const existing = await requestsRef
      .where('fromUserId', '==', fromUserId)
      .where('toUserId', '==', toUserId)
      .where('status', '==', 'pending')
      .get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'Demande déjà envoyée' });
    }
    const reverse = await requestsRef
      .where('fromUserId', '==', toUserId)
      .where('toUserId', '==', fromUserId)
      .where('status', '==', 'pending')
      .get();
    if (!reverse.empty) {
      return res.status(409).json({ error: 'Cet utilisateur vous a déjà envoyé une demande' });
    }
    await requestsRef.add({ fromUserId, toUserId, status: 'pending', createdAt: new Date() });
    res.status(201).json({ message: 'Demande envoyée' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les demandes d'amis reçues
router.get('/friend-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const requestsRef = db.collection('friendRequests');
    const snapshot = await requestsRef
      .where('toUserId', '==', userId)
      .where('status', '==', 'pending')
      .get();
    const requests = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      // Récupérer le pseudo de l'expéditeur
      const fromUser = await db.collection('users').doc(data.fromUserId).get();
      return {
        requestId: doc.id,
        fromUserId: data.fromUserId,
        fromPseudo: fromUser.exists ? fromUser.data().pseudo : 'Utilisateur supprimé',
        createdAt: data.createdAt,
      };
    }));
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Répondre à une demande d'ami (accepter ou refuser)
router.post('/friend-request/respond', authenticateToken, async (req, res) => {
  const { requestId, action } = req.body; // action: 'accept' ou 'refuse'
  const userId = req.user.userId;
  if (!requestId || !['accept', 'refuse'].includes(action)) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }
  try {
    const requestRef = db.collection('friendRequests').doc(requestId);
    const requestDoc = await requestRef.get();
    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }
    const request = requestDoc.data();
    if (request.toUserId !== userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    if (action === 'accept') {
      // Créer l'amitié (dans les deux sens)
      const friendsRef = db.collection('friends');
      await friendsRef.add({ userA: userId, userB: request.fromUserId, createdAt: new Date() });
      await friendsRef.add({ userA: request.fromUserId, userB: userId, createdAt: new Date() });
      await requestRef.update({ status: 'accepted' });
      return res.json({ message: 'Ami accepté' });
    } else {
      await requestRef.update({ status: 'refused' });
      return res.json({ message: 'Demande refusée' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

