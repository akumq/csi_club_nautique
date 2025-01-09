const router = require('express').Router();

// Importer le contrôleur des clients
const clientController = require('../controllers/clients.controller');

// Route pour récupérer tous les clients
router.get('/', clientController.getClients);

// Route pour récupérer un client par ID
router.get('/:id', clientController.getClientById);

// Route pour créer un nouveau client
router.post('/', clientController.createClient);

// Route pour mettre à jour un client existant
router.put('/:id', clientController.updateClient);

// Route pour supprimer un client
router.delete('/:id', clientController.deleteClient);

module.exports = router;
