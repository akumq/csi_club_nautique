
const express = require('express');
const router = express.Router();
const partenairesController = require('../controllers/partenaires.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth')


//routes pour les partenaires

router.get('/', authenticateToken, partenairesController.getPartenaires);//avoir la liste des partenaires
router.get('/:id', authenticateToken, partenairesController.getPartenaireById);// Avoir les détails d'un partenaire avec son ID
router.post('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), partenairesController.createPartenaire);// Créer un partenaire
router.put('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), partenairesController.updatePartenaire);// Mettre à jour les infos d'un partenaire
router.delete('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), partenairesController.deletePartenaire);// Supprimer un partenaire


module.exports = router;

