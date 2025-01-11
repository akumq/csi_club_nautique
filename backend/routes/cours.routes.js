const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const coursController = require('../controllers/cours.controller');

// Route pour récupérer tous les clients
router.get('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), coursController.getCours);

// Route pour récupérer un client par ID
router.get('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), coursController.getCoursById);

// Route pour créer un nouveau client
router.post('/',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), coursController.createCours);

// Route pour mettre à jour un client existant
router.put('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), coursController.updateCours);

// Route pour supprimer un client
router.delete('/:id',authenticateToken, authorizeRole(['administrateur', 'proprietaire']), coursController.deleteCours);

module.exports = router;
