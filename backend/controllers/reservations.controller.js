const pool = require('../database');


// Récupérer tous les Reservations
exports.getReservations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Reservation');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des Reservation', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer un client par ID
exports.getReservationById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM Reservation WHERE Reservation.id = $1',
            [id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Reservation non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du Reservation', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};


// Créer un nouveau Reservation
exports.createReservation = async (req, res) => {
    const { date, duree, typeRes, tarif, caution, nbParticipants, client_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO Reservation (date, duree, typeRes, tarif, caution, nbParticipants, client_id  ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [date, duree, typeRes, tarif, caution, nbParticipants, client_id ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la création du Reservation', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Mettre à jour un Reservation
exports.updateReservation = async (req, res) => {
    const { id } = req.params;
    const { date, duree, typeRes, tarif, caution, nbParticipants, client_id } = req.body;
    try {
        const result = await pool.query(
            'UPDATE Reservation SET date = $1, duree = $2, typeRes = $3, tarif = $4, caution = $5, nbParticipants = $6, client_id = $7 WHERE id = $8 RETURNING *',
            [date, duree, typeRes, tarif, caution, nbParticipants, client_id, id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Reservation non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour du Reservation', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer un Reservation
exports.deleteReservation = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Reservation WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Reservation supprimé avec succès' });
        } else {
            res.status(404).json({ message: 'Reservation non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la suppression du Reservation', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};