const pool = require('../database');


// Récupérer tous les Locations
exports.getLocations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Location');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des Location', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer un client par ID
exports.getLocationById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM Location WHERE Location.id = $1',
            [id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Location non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du Location', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Créer un nouveau Location
exports.createLocation = async (req, res) => {
    const { heureDebut, heureFin, materiel_id, etat, nbParticipants, client_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO Location (heureDebut, heureFin, materiel_id, etat, nbParticipants, client_id ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [heureDebut, heureFin, materiel_id, etat, nbParticipants, client_id ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la création du Location', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Mettre à jour un Location
exports.updateLocation = async (req, res) => {
    const { id } = req.params;
    const { heureDebut, heureFin, materiel_id, etat, nbParticipants, client_id} = req.body;
    try {
        const result = await pool.query(
            'UPDATE Location SET heureDebut = $1, heureFin = $2, materiel_id = $3, etat = $4, nbParticipants = $5, client_id = $6 WHERE id = $7 RETURNING *',
            [heureDebut, heureFin, materiel_id, etat, nbParticipants, client_id, id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Location non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour du Location', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer un Location
exports.deleteLocation = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Location WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Location supprimé avec succès' });
        } else {
            res.status(404).json({ message: 'Location non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la suppression du Location', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};