const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const materielController = require('../controllers/materiels.controller');

// Route pour récupérer tous les matériels
router.get('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.getMateriels);

// Route pour récupérer un matériel par ID
router.get('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.getMaterielById);

// Route pour créer un nouveau matériel
router.post('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.createMateriel);

// Route pour mettre à jour un matériel
router.put('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.updateMateriel);

// Route pour supprimer un matériel
router.delete('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.deleteMateriel);

module.exports = router;
