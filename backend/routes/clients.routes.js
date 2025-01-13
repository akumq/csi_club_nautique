const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const clientsController = require('../controllers/clients.controller');

// Routes pour les clients
router.get('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), clientsController.getAllClients);
router.get('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), clientsController.getClientById);
router.post('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), clientsController.createClient);
router.put('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), clientsController.updateClient);
router.delete('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), clientsController.deleteClient);
router.post('/achat-forfait', authenticateToken, clientsController.achatForfait);
router.get('/:id/factures', authenticateToken, clientsController.getClientFactures);

module.exports = router;
