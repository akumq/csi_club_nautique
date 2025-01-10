const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const moniteurController = require('../controllers/moniteurs.controller');

// Route pour récupérer tous les clients
router.get('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), moniteurController.getMoniteurs);

// Route pour récupérer un client par ID
router.get('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), moniteurController.getMoniteurById);

// Route pour créer un nouveau client
router.post('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), moniteurController.createMoniteur);

// Route pour mettre à jour un client existant
router.put('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), moniteurController.updateMoniteur);

// Route pour supprimer un client
router.delete('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), moniteurController.deleteMoniteur);

module.exports = router;
