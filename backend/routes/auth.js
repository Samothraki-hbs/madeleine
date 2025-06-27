// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ limits: { files: 5 } });
const { bucket } = require('../db');

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

// Créer un album partagé
router.post('/albums', authenticateToken, async (req, res) => {
  const { name, memberIds } = req.body;
  const createdBy = req.user.userId;
  if (!name || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ error: 'Nom et membres requis' });
  }
  // Ajouter le créateur dans la liste des membres si absent
  const members = Array.from(new Set([...memberIds, createdBy]));
  try {
    const albumRef = await db.collection('albums').add({
      name,
      members,
      createdBy,
      createdAt: new Date(),
    });
    res.status(201).json({ albumId: albumRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les albums où l'utilisateur est membre
router.get('/albums', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const snapshot = await db.collection('albums').where('members', 'array-contains', userId).get();
    const albums = snapshot.docs.map(doc => ({ albumId: doc.id, ...doc.data() }));
    res.json({ albums });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les photos d'un album
router.get('/albums/:id/photos', authenticateToken, async (req, res) => {
  const albumId = req.params.id;
  try {
    const snapshot = await db.collection('photos').where('albumId', '==', albumId).get();
    const photos = snapshot.docs.map(doc => ({ photoId: doc.id, ...doc.data() }));
    res.json({ photos });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter des photos à un album (upload fichiers)
router.post('/albums/:id/photos', authenticateToken, upload.array('photos', 5), async (req, res) => {
  console.log('Requête reçue pour upload photos');
  const albumId = req.params.id;
  const uploaderId = req.user.userId;
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucun fichier reçu' });
  }
  try {
    const urls = [];
    for (const file of req.files) {
      // Upload vers Firebase Storage à la racine (warehouse)
      const destination = `${Date.now()}_${file.originalname}`;
      const blob = bucket.file(destination);
      await blob.save(file.buffer, { contentType: file.mimetype });
      // Rendre le fichier public (optionnel)
      await blob.makePublic();
      const url = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      urls.push(url);
      // Enregistrer dans Firestore
      await db.collection('photos').add({ albumId, uploaderId, url, createdAt: new Date() });
    }
    res.status(201).json({ urls });
  } catch (err) {
    console.error('Erreur upload:', err);
    res.status(500).json({ error: 'Erreur upload' });
  }
});

// Récupérer la liste des amis de l'utilisateur connecté
router.get('/friends', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const friendsRef = db.collection('friends');
    const snapshot = await friendsRef.where('userA', '==', userId).get();
    const friends = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      const userDoc = await db.collection('users').doc(data.userB).get();
      return userDoc.exists ? { userId: data.userB, pseudo: userDoc.data().pseudo } : null;
    }));
    res.json({ friends: friends.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Photos à trier pour un utilisateur dans un album
router.get('/albums/:id/photos-to-sort', authenticateToken, async (req, res) => {
  const albumId = req.params.id;
  const userId = req.user.userId;
  try {
    // Récupère toutes les photos de l'album
    const photosSnap = await db.collection('photos').where('albumId', '==', albumId).get();
    const allPhotos = photosSnap.docs.map(doc => ({ photoId: doc.id, ...doc.data() }));
    // Récupère les statuts de l'utilisateur pour ces photos
    const statusSnap = await db.collection('userPhotoStatus')
      .where('userId', '==', userId)
      .where('albumId', '==', albumId)
      .get();
    const donePhotoIds = statusSnap.docs.map(doc => doc.data().photoId);
    // Filtre les photos non triées
    const toSort = allPhotos.filter(p => !donePhotoIds.includes(p.photoId));
    res.json({ photos: toSort });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Enregistrer le choix de l'utilisateur pour une photo
router.post('/photos/:photoId/status', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const photoId = req.params.photoId;
  const { albumId, status } = req.body; // status: archived | kept | pinned
  if (!['archived', 'kept', 'pinned'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }
  try {
    await db.collection('userPhotoStatus').add({ userId, photoId, albumId, status, createdAt: new Date() });
    if (status === 'pinned') {
      await db.collection('pins').add({ userId, photoId, albumId, pinnedAt: new Date() });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mes épingles
router.get('/pins/me', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const pinsSnap = await db.collection('pins').where('userId', '==', userId).get();
    const pins = pinsSnap.docs.map(doc => ({ pinId: doc.id, ...doc.data() }));
    res.json({ pins });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Epingles de mes amis
router.get('/pins/friends', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    // Récupère mes amis
    const friendsSnap = await db.collection('friends').where('userA', '==', userId).get();
    const friendIds = friendsSnap.docs.map(doc => doc.data().userB);
    // Récupère les pins de mes amis
    let pins = [];
    if (friendIds.length > 0) {
      const pinsSnap = await db.collection('pins').where('userId', 'in', friendIds).get();
      pins = pinsSnap.docs.map(doc => ({ pinId: doc.id, ...doc.data() }));
    }
    res.json({ pins });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

