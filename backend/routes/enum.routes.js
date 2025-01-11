const express = require('express');
const router = express.Router();
const enumController = require('../controllers/enum.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Route pour récupérer toutes les valeurs des enums
router.get('/enums', authenticateToken, authorizeRole(['administrateur', 'proprietaire', 'moniteur']), enumController.getEnums);

// Routes spécifiques pour chaque enum (si nécessaire)
router.get('/niveaux', authenticateToken, authorizeRole(['administrateur', 'proprietaire', 'moniteur']), enumController.getNiveaux);

module.exports = router;
