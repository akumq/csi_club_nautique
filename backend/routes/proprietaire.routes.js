const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const proprietaireController = require('../controllers/proprietaire.controller');

// Route pour récupérer tous les clients
router.get('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), proprietaireController.getProprietaires);

// Route pour récupérer un client par ID
router.get('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), proprietaireController.getProprietaireById);

// Route pour créer un nouveau client
router.post('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), proprietaireController.createProprietaire);

// Route pour mettre à jour un client existant
router.put('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), proprietaireController.updateMoniteur);

// Route pour supprimer un client
router.delete('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), proprietaireController.deleteProprietaire);

module.exports = router;
