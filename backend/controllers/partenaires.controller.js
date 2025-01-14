const pool = require('../database');

// Récupérer tous les partenaires
exports.getPartenaires = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Partenaire ORDER BY id');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des partenaires', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer tous les partenaires by ID
exports.getPartenairesByID = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query('SELECT * FROM Partenaire as p Where $1 = id', [id] );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des partenaires', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Créer un nouveau partenaire
exports.createPartenaire = async (req, res) => {
    const { nomCamping, remise } = req.body;

    if (!nomCamping || remise === undefined) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO Partenaire (nomCamping, remise) VALUES ($1, $2) RETURNING *',
            [nomCamping, remise]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la création du partenaire', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Mettre à jour un partenaire
exports.updatePartenaire = async (req, res) => {
    const { id } = req.params;
    const { nomCamping, remise } = req.body;

    try {
        const result = await pool.query(
            'UPDATE Partenaire SET nomCamping = $1, remise = $2 WHERE id = $3 RETURNING *',
            [nomCamping, remise, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Partenaire non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la mise à jour du partenaire', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer un partenaire
exports.deletePartenaire = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM Partenaire WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Partenaire non trouvé' });
        }

        res.json({ message: 'Partenaire supprimé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression du partenaire', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
}; 