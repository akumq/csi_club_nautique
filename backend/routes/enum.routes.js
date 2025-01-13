const express = require('express');
const router = express.Router();
const enumController = require('../controllers/enum.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Route pour récupérer toutes les valeurs des enums
router.get('/enums', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), enumController.getEnums);

// Routes spécifiques pour chaque enum (si nécessaire)
router.get('/niveaux', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), enumController.getNiveaux);

router.post('/:enumName/values', authenticateToken, authorizeRole(['administrateur']), enumController.addEnumValue);
router.delete('/:enumName/values/:value', authenticateToken, authorizeRole(['administrateur']), enumController.deleteEnumValue);

module.exports = router;
