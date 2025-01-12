const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const reservationsController = require('../controllers/reservations.controller');

// Route pour récupérer tous les clients
router.get('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), reservationsController.getReservations);

// Route pour récupérer un client par ID
router.get('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), reservationsController.getReservationById);

// Route pour créer un nouveau client
router.post('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), reservationsController.createReservation);

// Route pour mettre à jour un client existant
router.put('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), reservationsController.updateReservation);

// Route pour supprimer un client
router.delete('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), reservationsController.deleteReservation);

// Ajouter ces nouvelles routes
router.post('/:id/materiels', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), reservationsController.addMaterielToReservation);

module.exports = router;
