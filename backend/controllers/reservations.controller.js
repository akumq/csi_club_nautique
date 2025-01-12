const pool = require('../database');


// Récupérer tous les Reservations
exports.getReservations = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, 
                   array_agg(DISTINCT m.id) as materiel_ids,
                   array_agg(DISTINCT m.type) as materiel_types
            FROM Reservation r
            LEFT JOIN reservation_materiel rm ON r.id = rm.reservation_id
            LEFT JOIN Materiel m ON rm.materiel_id = m.id
            GROUP BY r.id
        `);
        
        const reservations = result.rows.map(row => ({
            ...row,
            materiels: row.materiel_ids[0] ? 
                row.materiel_ids.map((id, index) => ({
                    id: id,
                    type: row.materiel_types[index]
                })) : []
        }));

        res.status(200).json(reservations);
    } catch (err) {
        console.error('Erreur lors de la récupération des réservations', err);
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
    const { date, duree, typeRes, tarif, caution, nbParticipants, client_id, materiel_id } = req.body;
    
    try {
        // Commencer une transaction
        await pool.query('BEGIN');

        // Vérifier si le matériel est disponible
        if (materiel_id) {
            const materielCheck = await pool.query(
                'SELECT statut FROM Materiel WHERE id = $1',
                [materiel_id]
            );

            if (materielCheck.rows.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ message: 'Matériel non trouvé' });
            }

            if (materielCheck.rows[0].statut !== 'Disponible') {
                await pool.query('ROLLBACK');
                return res.status(400).json({ message: 'Matériel non disponible' });
            }
        }

        // Créer la réservation
        const reservationResult = await pool.query(
            'INSERT INTO Reservation (date, duree, typeRes, tarif, caution, nbParticipants, client_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [date, duree, typeRes, tarif, caution, nbParticipants, client_id]
        );

        const reservation = reservationResult.rows[0];

        // Si un matériel est spécifié, l'associer à la réservation
        if (materiel_id) {
            await pool.query(
                'INSERT INTO reservation_materiel (reservation_id, materiel_id) VALUES ($1, $2)',
                [reservation.id, materiel_id]
            );

            // Mettre à jour le statut du matériel
            await pool.query(
                'UPDATE Materiel SET statut = $1 WHERE id = $2',
                ['En cours d\'utilisation', materiel_id]
            );

            // Si c'est une location, créer l'entrée dans la table Location
            if (typeRes === 'Location') {
                const { heureDebut, heureFin } = req.body;
                await pool.query(
                    'INSERT INTO Location (heureDebut, heureFin, materiel_id, etat, nbParticipants, client_id, reservation_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [heureDebut, heureFin, materiel_id, 'Actif', nbParticipants, client_id, reservation.id]
                );
            }
        }

        // Si c'est un cours, créer l'entrée dans la table Cours
        if (typeRes === 'Cours') {
            const { heureDebut, heureFin, niveau, moniteur_id } = req.body;
            await pool.query(
                'INSERT INTO Cours (heureDebut, heureFin, niveau, etat, nbParticipants, moniteur_id, reservation_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [heureDebut, heureFin, niveau, 'Actif', nbParticipants, moniteur_id, reservation.id]
            );
        }

        // Valider la transaction
        await pool.query('COMMIT');

        // Récupérer la réservation complète avec ses détails
        const finalResult = await pool.query(`
            SELECT r.*, 
                   array_agg(DISTINCT m.id) as materiel_ids,
                   array_agg(DISTINCT m.type) as materiel_types,
                   CASE 
                       WHEN r.typeRes = 'Cours' THEN json_build_object(
                           'heureDebut', c.heureDebut,
                           'heureFin', c.heureFin,
                           'niveau', c.niveau,
                           'moniteur_id', c.moniteur_id
                       )
                       WHEN r.typeRes = 'Location' THEN json_build_object(
                           'heureDebut', l.heureDebut,
                           'heureFin', l.heureFin,
                           'materiel_id', l.materiel_id
                       )
                   END as details
            FROM Reservation r
            LEFT JOIN reservation_materiel rm ON r.id = rm.reservation_id
            LEFT JOIN Materiel m ON rm.materiel_id = m.id
            LEFT JOIN Cours c ON r.id = c.reservation_id
            LEFT JOIN Location l ON r.id = l.reservation_id
            WHERE r.id = $1
            GROUP BY r.id, c.heureDebut, c.heureFin, c.niveau, c.moniteur_id, 
                     l.heureDebut, l.heureFin, l.materiel_id
        `, [reservation.id]);

        res.status(201).json({
            ...finalResult.rows[0],
            materiels: finalResult.rows[0].materiel_ids[0] ? 
                finalResult.rows[0].materiel_ids.map((id, index) => ({
                    id: id,
                    type: finalResult.rows[0].materiel_types[index]
                })) : []
        });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la création de la réservation:', err);
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