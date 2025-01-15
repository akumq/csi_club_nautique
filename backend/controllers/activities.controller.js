const pool = require('../database');

// Récupérer toutes les activités (cours et locations)
exports.getActivities = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.id,
                r.date,
                r.duree,
                r.typeRes,
                r.tarif,
                r.caution,
                r.nbParticipants,
                c.nom AS client_nom,
                c.prenom AS client_prenom,
                CASE 
                    WHEN co.id IS NOT NULL THEN json_build_object(
                        'type', 'cours',
                        'heureDebut', co.heureDebut,
                        'heureFin', co.heureFin,
                        'niveau', co.niveau,
                        'etat', co.etat,
                        'moniteur_id', co.moniteur_id
                    )
                    WHEN l.id IS NOT NULL THEN json_build_object(
                        'type', 'location',
                        'heureDebut', l.heureDebut,
                        'heureFin', l.heureFin,
                        'etat', l.etat,
                        'materiel_id', l.materiel_id
                    )
                END AS details
            FROM Reservation r
            LEFT JOIN Client c ON r.client_id = c.id
            LEFT JOIN Cours co ON r.id = co.reservation_id
            LEFT JOIN Location l ON r.id = l.reservation_id
            ORDER BY r.date, COALESCE(co.heureDebut, l.heureDebut)
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer une activité par ID
exports.getActiviteById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                r.id,
                r.date,
                r.duree,
                r.typeRes,
                r.tarif,
                r.caution,
                r.nbParticipants,
                c.nom AS client_nom,
                c.prenom AS client_prenom,
                CASE 
                    WHEN co.id IS NOT NULL THEN json_build_object(
                        'type', 'cours',
                        'heureDebut', co.heureDebut,
                        'heureFin', co.heureFin,
                        'niveau', co.niveau,
                        'etat', co.etat,
                        'moniteur_id', co.moniteur_id
                    )
                    WHEN l.id IS NOT NULL THEN json_build_object(
                        'type', 'location',
                        'heureDebut', l.heureDebut,
                        'heureFin', l.heureFin,
                        'etat', l.etat,
                        'materiel_id', l.materiel_id
                    )
                END AS details
            FROM Reservation r
            LEFT JOIN Client c ON r.client_id = c.id
            LEFT JOIN Cours co ON r.id = co.reservation_id
            LEFT JOIN Location l ON r.id = l.reservation_id
            WHERE r.id = $1
        `, [id]);
        
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Activité non trouvée' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'activité:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Créer une nouvelle activité (cours ou location)
exports.createActivity = async (req, res) => {
    const { 
        date,
        duree,
        typeRes,
        tarif,
        caution,
        nbParticipants,
        client_ids,
        details
    } = req.body;
    console.log(req.body);
    try {
        await pool.query('BEGIN');

        // Créer d'abord la réservation
        const reservationResult = await pool.query(
            'INSERT INTO Reservation (date, duree, typeRes, tarif, caution, nbParticipants) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [date, duree, typeRes, tarif, caution, nbParticipants]
        );
        
        const reservationId = reservationResult.rows[0].id;

        // Insérer les clients associés à cette réservation
        for (const client_id of client_ids) {
            await pool.query(
                'UPDATE Reservation SET client_id = $1 WHERE id = $2',
                [client_id, reservationId]
            );
        }

        // Selon le type, créer soit un cours soit une location
        if (typeRes === 'Cours') {
            await pool.query(
                'INSERT INTO Cours (heureDebut, heureFin, niveau, etat, nbParticipants, moniteur_id, reservation_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [
                    details.heureDebut,
                    details.heureFin,
                    details.niveau,
                    'Actif',
                    nbParticipants,
                    details.moniteur_id,
                    reservationId
                ]
            );
        } else if (typeRes === 'Location') {
            await pool.query(
                'INSERT INTO Location (heureDebut, heureFin, materiel_id, etat, nbParticipants, reservation_id) VALUES ($1, $2, $3, $4, $5, $6)',
                [
                    details.heureDebut,
                    details.heureFin,
                    details.materiel_id,
                    'Actif',
                    nbParticipants,
                    reservationId
                ]
            );

            // Mettre à jour le statut du matériel
            await pool.query(
                'UPDATE Materiel SET statut = $1 WHERE id = $2',
                ['Réservé', details.materiel_id]
            );
        }

        await pool.query('COMMIT');
        res.status(201).json({ message: 'Activité créée avec succès', id: reservationId });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la création de l\'activité:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Mettre à jour une activité
exports.updateActivity = async (req, res) => {
    const { id } = req.params;
    const { 
        date,
        duree,
        typeRes,
        tarif,
        caution,
        nbParticipants,
        client_id,
        details
    } = req.body;

    try {
        await pool.query('BEGIN');

        // Mettre à jour la réservation
        const reservationResult = await pool.query(
            'UPDATE Reservation SET date = $1, duree = $2, typeRes = $3, tarif = $4, caution = $5, nbParticipants = $6, client_id = $7 WHERE id = $8 RETURNING *',
            [date, duree, typeRes, tarif, caution, nbParticipants, client_id, id]
        );

        if (reservationResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Activité non trouvée' });
        }

        // Mettre à jour le cours ou la location selon le type
        if (typeRes === 'Cours') {
            await pool.query(
                `UPDATE Cours 
                SET heureDebut = $1, heureFin = $2, niveau = $3, nbParticipants = $4, moniteur_id = $5
                WHERE reservation_id = $6`,
                [
                    details.heureDebut,
                    details.heureFin,
                    details.niveau,
                    nbParticipants,
                    details.moniteur_id,
                    id
                ]
            );
        } else if (typeRes === 'Location') {
            // Récupérer l'ancien matériel_id
            const oldLocationResult = await pool.query(
                'SELECT materiel_id FROM Location WHERE reservation_id = $1',
                [id]
            );

            if (oldLocationResult.rows.length > 0) {
                const oldMaterielId = oldLocationResult.rows[0].materiel_id;
                // Libérer l'ancien matériel
                await pool.query(
                    'UPDATE Materiel SET statut = $1 WHERE id = $2',
                    ['Disponible', oldMaterielId]
                );
            }

            await pool.query(
                `UPDATE Location 
                SET heureDebut = $1, heureFin = $2, materiel_id = $3, nbParticipants = $4, client_id = $5
                WHERE reservation_id = $6`,
                [
                    details.heureDebut,
                    details.heureFin,
                    details.materiel_id,
                    nbParticipants,
                    client_id,
                    id
                ]
            );

            // Réserver le nouveau matériel
            await pool.query(
                'UPDATE Materiel SET statut = $1 WHERE id = $2',
                ['Réservé', details.materiel_id]
            );
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Activité mise à jour avec succès' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la mise à jour de l\'activité:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer une activité
exports.deleteActivity = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('BEGIN');

        // Libérer le matériel si c'est une location
        const locationResult = await pool.query(
            'SELECT materiel_id FROM Location WHERE reservation_id = $1',
            [id]
        );

        if (locationResult.rows.length > 0) {
            await pool.query(
                'UPDATE Materiel SET statut = $1 WHERE id = $2',
                ['Disponible', locationResult.rows[0].materiel_id]
            );
        }

        // Supprimer le cours ou la location
        await pool.query('DELETE FROM Cours WHERE reservation_id = $1', [id]);
        await pool.query('DELETE FROM Location WHERE reservation_id = $1', [id]);

        // Supprimer la réservation
        const result = await pool.query('DELETE FROM Reservation WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Activité non trouvée' });
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Activité supprimée avec succès' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la suppression de l\'activité:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getActivitiesByClient = async (req, res) => {
    const { id } = req.params;
    console.log('Fetching activities for client ID:', id);
    try {
        const result = await pool.query(`
            SELECT * FROM activities WHERE client_id = $1
        `, [id]);
        console.log('Activities found:', result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};