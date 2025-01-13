const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const activitiesController = require('../controllers/activities.controller');

// Route pour récupérer toutes les activités
router.get('/', authenticateToken, activitiesController.getActivities);

// Route pour récupérer une activité par ID
router.get('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire', 'moniteur']), activitiesController.getActiviteById);

// Route pour créer une nouvelle activité
router.post('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), activitiesController.createActivity);

// Route pour mettre à jour une activité
router.put('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), activitiesController.updateActivity);

// Route pour supprimer une activité
router.delete('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), activitiesController.deleteActivity);

module.exports = router;