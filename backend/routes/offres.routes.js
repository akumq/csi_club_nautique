const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const offresController = require('../controllers/offres.controller');

// Routes pour les offres
router.get('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), offresController.getOffres);
router.get('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), offresController.getOffreById);
router.post('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), offresController.createOffre);
router.put('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), offresController.updateOffre);
router.delete('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), offresController.deleteOffre);

module.exports = router; 