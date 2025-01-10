const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');


// Importer le contrôleur des clients
const clientController = require('../controllers/clients.controller');

// Route pour récupérer tous les clients
router.get('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire','moniteur']), clientController.getClients);

// Route pour récupérer un client par ID
router.get('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire','moniteur']), clientController.getClientById);

// Route pour créer un nouveau client
router.post('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), clientController.createClient);

// Route pour mettre à jour un client existant
router.put('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), clientController.updateClient);

// Route pour supprimer un client
router.delete('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), clientController.deleteClient);

module.exports = router;
