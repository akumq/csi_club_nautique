const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const reparationsController = require('../controllers/reparations.controller');

// Route pour créer une réparation
router.post('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), reparationsController.createRepair);

// Route pour récupérer toutes les réparations
router.get('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), reparationsController.getRepairs);

// Route pour supprimer une réparation
router.delete('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), reparationsController.deleteRepair);

module.exports = router; 