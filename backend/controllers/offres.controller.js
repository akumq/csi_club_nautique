const pool = require('../database');

// Récupérer toutes les offres
exports.getOffres = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Offre ORDER BY id');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des offres', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer une offre par ID
exports.getOffreById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM Offre WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Offre non trouvée' });
        }
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'offre', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Créer une nouvelle offre
exports.createOffre = async (req, res) => {
    const { nomOffre, prix, quantite } = req.body;

    if (!nomOffre || prix === undefined || quantite === undefined) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO Offre (nomOffre, prix, quantite) VALUES ($1, $2, $3) RETURNING *',
            [nomOffre, prix, quantite]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la création de l\'offre', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Mettre à jour une offre
exports.updateOffre = async (req, res) => {
    const { id } = req.params;
    const { nomOffre, prix, quantite } = req.body;

    try {
        const result = await pool.query(
            'UPDATE Offre SET nomOffre = $1, prix = $2, quantite = $3 WHERE id = $4 RETURNING *',
            [nomOffre, prix, quantite, id]
        );

        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Offre non trouvée' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour de l\'offre', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer une offre
exports.deleteOffre = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM Offre WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Offre supprimée avec succès' });
        } else {
            res.status(404).json({ message: 'Offre non trouvée' });
        }
    } catch (err) {
        console.error('Erreur lors de la suppression de l\'offre', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
}; 