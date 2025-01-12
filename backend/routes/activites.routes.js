const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const activitesController = require('../controllers/activites.controller');

// Route pour récupérer toutes les activités
router.get('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire', 'moniteur']), activitesController.getActivites);

// Route pour récupérer une activité par ID
router.get('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire', 'moniteur']), activitesController.getActiviteById);

// Route pour créer une nouvelle activité
router.post('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), activitesController.createActivite);

// Route pour mettre à jour une activité
router.put('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), activitesController.updateActivite);

// Route pour supprimer une activité
router.delete('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), activitesController.deleteActivite);

// Routes pour la gestion des matériels associés
router.post('/:id/materiels', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), activitesController.addMaterielToActivite);
router.delete('/:id/materiels/:materielId', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), activitesController.removeMaterielFromActivite);

module.exports = router; 