const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const personnelsController = require('../controllers/personnels.controller');

// Route pour récupérer tous les personnels (avec filtre optionnel par type)
router.get('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), personnelsController.getPersonnels);

// Route pour récupérer un personnel par ID
router.get('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), personnelsController.getPersonnelById);

// Route pour créer un nouveau personnel
router.post('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), personnelsController.createPersonnel);

// Route pour mettre à jour un personnel existant
router.put('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), personnelsController.updatePersonnel);

// Route pour supprimer un personnel
router.delete('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), personnelsController.deletePersonnel);

module.exports = router; 