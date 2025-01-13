const router = require('express').Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const materielController = require('../controllers/materiels.controller');

// Route pour récupérer tous les matériels
router.get('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.getMateriels);

// Route pour récupérer un matériel par ID
router.get('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.getMaterielById);

// Route pour créer un nouveau matériel
router.post('/', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.createMateriel);

// Route pour mettre à jour un matériel
router.put('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.updateMateriel);

// Route pour supprimer un matériel
router.delete('/:id', authenticateToken, authorizeRole(['administrateur', 'proprietaire']), materielController.deleteMateriel);

// Route pour récupérer les matériels disponibles
router.get('/disponibles', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id,
        m.type,
        m.numero,
        m.statut,
        m.description
      FROM Materiel m
      WHERE m.statut = 'Disponible'
      ORDER BY m.type, m.numero
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des matériels disponibles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
