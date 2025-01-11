const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const locationsController = require('../controllers/locations.controller');

// Route pour récupérer tous les clients
router.get('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), locationsController.getLocations);

// Route pour récupérer un client par ID
router.get('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), locationsController.getLocationById);

// Route pour créer un nouveau client
router.post('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), locationsController.createLocation);

// Route pour mettre à jour un client existant
router.put('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), locationsController.updateLocation);

// Route pour supprimer un client
router.delete('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), locationsController.deleteLocation);

module.exports = router;
