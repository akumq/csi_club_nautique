const pool = require('../database');


// Récupérer toutes les réservations
exports.getReservations = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, 
                   m.type AS materiel_type,
                   c.nom AS client_nom
            FROM Reservation r
            LEFT JOIN Materiel m ON r.materiel_id = m.id
            LEFT JOIN Client c ON r.client_id = c.id
            ORDER BY r.date
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        res.status(500).json({ message: 'Erreur serveur' });
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


// Créer une nouvelle réservation
exports.createReservation = async (req, res) => {
    const { date, client_id, materiel_id } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO Reservation (date, client_id, materiel_id)
            VALUES ($1, $2, $3) RETURNING *
        `, [date, client_id, materiel_id]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la création de la réservation:', error);
        res.status(500).json({ message: 'Erreur serveur' });
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

// Ajouter un matériel à une réservation
exports.addMaterielToReservation = async (req, res) => {
    const { id } = req.params;
    const { materielId } = req.body;
    
    try {
        // Vérifier si le matériel est disponible
        const materielCheck = await pool.query(
            'SELECT statut FROM Materiel WHERE id = $1',
            [materielId]
        );

        if (materielCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Matériel non trouvé' });
        }

        if (materielCheck.rows[0].statut !== 'Disponible') {
            return res.status(400).json({ message: 'Matériel non disponible' });
        }

        // Ajouter le matériel à la réservation
        await pool.query(
            'INSERT INTO reservation_materiel (reservation_id, materiel_id) VALUES ($1, $2)',
            [id, materielId]
        );

        // Mettre à jour le statut du matériel
        await pool.query(
            'UPDATE Materiel SET statut = $1 WHERE id = $2',
            ['En cours d\'utilisation', materielId]
        );

        res.status(200).json({ message: 'Matériel ajouté à la réservation' });
    } catch (err) {
        console.error('Erreur lors de l\'ajout du matériel à la réservation', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer un matériel d'une réservation
exports.removeMaterielFromReservation = async (req, res) => {
    const { id, materielId } = req.params;
    
    try {
        const result = await pool.query(
            'DELETE FROM reservation_materiel WHERE reservation_id = $1 AND materiel_id = $2',
            [id, materielId]
        );

        if (result.rowCount > 0) {
            // Remettre le matériel comme disponible
            await pool.query(
                'UPDATE Materiel SET statut = $1 WHERE id = $2',
                ['Disponible', materielId]
            );
            res.status(200).json({ message: 'Matériel retiré de la réservation' });
        } else {
            res.status(404).json({ message: 'Association réservation-matériel non trouvée' });
        }
    } catch (err) {
        console.error('Erreur lors de la suppression du matériel de la réservation', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};