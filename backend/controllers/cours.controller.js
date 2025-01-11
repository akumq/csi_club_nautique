const pool = require('../database');

// Récupérer tous les cours
exports.getCours = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Cours');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des cours', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer un cours par ID
exports.getCoursById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM Cours WHERE Cours.id = $1',
            [id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Cours non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du Cours', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};


// Créer un nouveau Cours
exports.createCours = async (req, res) => {
    const { nom, heureDebut, heureFin, niveau, etat, nbParticipants, moniteur_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO cours (nom, heureDebut, heureFin, niveau, etat, nbParticipants, moniteur_id ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nom, heureDebut, heureFin, niveau, etat, nbParticipants, moniteur_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la création du cours', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Mettre à jour un Cours
exports.updateCours = async (req, res) => {
    const { id } = req.params;
    const { nom, heureDebut, heureFin, niveau, etat, nbParticipants, moniteur_id } = req.body;
    try {
        const result = await pool.query(
            'UPDATE cours SET nom = $1, heureDebut = $2, heureFin = $3, niveau = $4, etat = $5, nbParticipants = $6, moniteur_id = $7 WHERE id = $8 RETURNING *',
            [nom, heureDebut, heureFin, niveau, etat, nbParticipants, moniteur_id, id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Cours non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour du Cours', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer un Cours
exports.deleteCours = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Cours WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Cours supprimé avec succès' });
        } else {
            res.status(404).json({ message: 'Cours non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la suppression du Cours', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};