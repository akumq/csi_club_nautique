const pool = require('../database');

exports.getActivities = async (req, res) => {
    const { start, end } = req.query;
    
    try {
        console.log('Query dates:', start, end);
        // Assurez-vous que les dates sont bien parsées
        const startDate = new Date(start);
        const endDate = new Date(end);
        console.log('Parsed dates:', startDate, endDate);

        const result = await pool.query(`
            WITH activities AS (
                -- Récupérer les cours
                SELECT 
                    r.id,
                    r.date,
                    'Cours' as type,
                    c.heureDebut,
                    c.heureFin,
                    jsonb_build_object(
                        'heureDebut', c.heureDebut,
                        'heureFin', c.heureFin,
                        'niveau', c.niveau,
                        'moniteur_id', c.moniteur_id,
                        'nbParticipants', c.nbParticipants,
                        'etat', c.etat
                    ) as details
                FROM Reservation r
                INNER JOIN Cours c ON r.id = c.reservation_id
                WHERE r.date BETWEEN $1::date AND $2::date

                UNION ALL

                -- Récupérer les locations
                SELECT 
                    r.id,
                    r.date,
                    'Location' as type,
                    l.heureDebut,
                    l.heureFin,
                    jsonb_build_object(
                        'heureDebut', l.heureDebut,
                        'heureFin', l.heureFin,
                        'nbParticipants', l.nbParticipants,
                        'client_id', l.client_id,
                        'etat', l.etat,
                        'materiel_id', l.materiel_id
                    ) as details
                FROM Reservation r
                INNER JOIN Location l ON r.id = l.reservation_id
                WHERE r.date BETWEEN $1::date AND $2::date

                UNION ALL

                -- Récupérer les réservations simples
                SELECT 
                    r.id,
                    r.date,
                    'Reservation' as type,
                    NULL as heureDebut,
                    NULL as heureFin,
                    jsonb_build_object(
                        'duree', r.duree,
                        'tarif', r.tarif,
                        'caution', r.caution,
                        'nbParticipants', r.nbParticipants,
                        'client_id', r.client_id,
                        'typeRes', r.typeRes
                    ) as details
                FROM Reservation r
                WHERE r.date BETWEEN $1::date AND $2::date
                AND NOT EXISTS (SELECT 1 FROM Cours c WHERE c.reservation_id = r.id)
                AND NOT EXISTS (SELECT 1 FROM Location l WHERE l.reservation_id = r.id)
            )
            SELECT 
                id,
                to_char(date, 'YYYY-MM-DD') as date,
                type as "typeActivite",
                details
            FROM activities
            ORDER BY date, heureDebut NULLS LAST
        `, [startDate, endDate]);
        
        console.log('Database result:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error in getActivities:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}; 


exports.getActiviteById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(`
            SELECT 
                r.id,
                r.date,
                CASE
                    WHEN c.id IS NOT NULL THEN 'Cours'
                    WHEN l.id IS NOT NULL THEN 'Location'
                    ELSE 'Reservation'
                END as typeActivite,
                CASE
                    WHEN c.id IS NOT NULL THEN jsonb_build_object(
                        'heureDebut', c.heureDebut,
                        'heureFin', c.heureFin,
                        'niveau', c.niveau,
                        'moniteur_id', c.moniteur_id,
                        'nbParticipants', c.nbParticipants,
                        'etat', c.etat
                    )
                    WHEN l.id IS NOT NULL THEN jsonb_build_object(
                        'heureDebut', l.heureDebut,
                        'heureFin', l.heureFin,
                        'nbParticipants', l.nbParticipants,
                        'client_id', l.client_id,
                        'etat', l.etat,
                        'materiel_id', l.materiel_id
                    )
                    ELSE jsonb_build_object(
                        'duree', r.duree,
                        'tarif', r.tarif,
                        'caution', r.caution,
                        'nbParticipants', r.nbParticipants,
                        'client_id', r.client_id,
                        'typeRes', r.typeRes
                    )
                END as details
            FROM Reservation r
            LEFT JOIN Cours c ON r.id = c.reservation_id
            LEFT JOIN Location l ON r.id = l.reservation_id
            WHERE r.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activité non trouvée' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'activité:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Créer une nouvelle activité
exports.createActivity = async (req, res) => {
    const { date, typeActivite, details, materiels } = req.body;
    
    try {
        await pool.query('BEGIN');

        // Calculer la durée
        const heureDebut = details.heureDebut;
        const heureFin = details.heureFin;
        const duree = calculateDuration(heureDebut, heureFin); // Fonction à définir

        // Définir un tarif et une caution par défaut si non fournis
        const tarif = details.tarif || 0; // Valeur par défaut
        const caution = details.caution || 0; // Valeur par défaut

        // Créer la réservation
        const reservationResult = await pool.query(
            'INSERT INTO Reservation (date, typeRes, duree, tarif, caution) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [date, typeActivite, duree, tarif, caution] // Inclure la caution ici
        );

        const reservationId = reservationResult.rows[0].id;

        if (typeActivite === 'Location') {
            // Créer la location
            await pool.query(
                `INSERT INTO Location (
                    reservation_id, heureDebut, heureFin, 
                    client_id, nbParticipants, etat
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    reservationId,
                    details.heureDebut,
                    details.heureFin,
                    details.client_id,
                    details.nbParticipants || 1,
                    'Actif'
                ]
            );

            // Retirer un forfait du client
            await pool.query(
                'UPDATE Clients SET forfait = forfait - 1 WHERE id = $1',
                [details.client_id]
            );

            // Mettre à jour le statut des matériels
            for (const materielId of materiels) {
                await pool.query(
                    'UPDATE Materiel SET statut = $1 WHERE id = $2',
                    ['En cours d\'utilisation', materielId]
                );

                // Ajouter l'association entre la réservation et le matériel
                await pool.query(
                    'INSERT INTO reservation_materiel (reservation_id, materiel_id) VALUES ($1, $2)',
                    [reservationId, materielId]
                );
            }
        }

        await pool.query('COMMIT');
        res.status(201).json({ message: 'Activité créée avec succès' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la création de l\'activité:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Fonction pour calculer la durée
const calculateDuration = (startTime, endTime) => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const duration = (end - start) / (1000 * 60); // Durée en minutes
    return duration;
};

// Mettre à jour une activité
exports.updateActivity = async (req, res) => {
    const { id } = req.params;
    const { date, duree, typeActivite, tarif, caution, nbParticipants, client_id, details } = req.body;
    
    try {
        await pool.query('BEGIN');

        // Valider et nettoyer les données
        const validatedData = {
            date: date || null,
            duree: parseInt(duree) || 0,
            typeActivite: typeActivite || 'Reservation',
            tarif: parseFloat(tarif) || 0, // Valeur par défaut
            caution: parseFloat(caution) || 0, // Valeur par défaut
            nbParticipants: parseInt(nbParticipants) || 1,
            client_id: client_id ? parseInt(client_id) : null
        };

        // Mettre à jour la réservation de base
        await pool.query(
            `UPDATE Reservation 
             SET date = $1, duree = $2, typeRes = $3, tarif = $4, 
                 caution = $5, nbParticipants = $6, client_id = $7 
             WHERE id = $8`,
            [validatedData.date, validatedData.duree, validatedData.typeActivite,
             validatedData.tarif, validatedData.caution, validatedData.nbParticipants,
             validatedData.client_id, id]
        );

        // Mettre à jour l'entrée spécifique selon le type
        if (typeActivite === 'Cours') {
            const validatedCours = {
                heureDebut: details.heureDebut || '00:00',
                heureFin: details.heureFin || '00:00',
                niveau: details.niveau || 'Débutant',
                moniteur_id: details.moniteur_id ? parseInt(details.moniteur_id) : null,
                nbParticipants: parseInt(details.nbParticipants) || 1
            };

            await pool.query(
                `UPDATE Cours 
                 SET heureDebut = $1, heureFin = $2, niveau = $3, 
                     moniteur_id = $4, nbParticipants = $5
                 WHERE reservation_id = $6`,
                [validatedCours.heureDebut, validatedCours.heureFin,
                 validatedCours.niveau, validatedCours.moniteur_id,
                 validatedCours.nbParticipants, id]
            );
        } else if (typeActivite === 'Location') {
            const validatedLocation = {
                heureDebut: details.heureDebut || '00:00',
                heureFin: details.heureFin || '00:00',
                materiel_id: details.materiel_id ? parseInt(details.materiel_id) : null,
                nbParticipants: parseInt(details.nbParticipants) || 1,
                client_id: details.client_id ? parseInt(details.client_id) : null
            };

            await pool.query(
                `UPDATE Location 
                 SET heureDebut = $1, heureFin = $2, materiel_id = $3,
                     nbParticipants = $4, client_id = $5
                 WHERE reservation_id = $6`,
                [validatedLocation.heureDebut, validatedLocation.heureFin,
                 validatedLocation.materiel_id, validatedLocation.nbParticipants,
                 validatedLocation.client_id, id]
            );
        }

        await pool.query('COMMIT');

        // Récupérer et renvoyer l'activité mise à jour
        const result = await pool.query(`
            SELECT 
                r.id,
                r.date,
                CASE
                    WHEN c.id IS NOT NULL THEN 'Cours'
                    WHEN l.id IS NOT NULL THEN 'Location'
                    ELSE 'Reservation'
                END as typeActivite,
                CASE
                    WHEN c.id IS NOT NULL THEN jsonb_build_object(
                        'heureDebut', c.heureDebut,
                        'heureFin', c.heureFin,
                        'niveau', c.niveau,
                        'moniteur_id', c.moniteur_id,
                        'nbParticipants', c.nbParticipants,
                        'etat', c.etat
                    )
                    WHEN l.id IS NOT NULL THEN jsonb_build_object(
                        'heureDebut', l.heureDebut,
                        'heureFin', l.heureFin,
                        'nbParticipants', l.nbParticipants,
                        'client_id', l.client_id,
                        'etat', l.etat,
                        'materiel_id', l.materiel_id
                    )
                    ELSE jsonb_build_object(
                        'duree', r.duree,
                        'tarif', r.tarif,
                        'caution', r.caution,
                        'nbParticipants', r.nbParticipants,
                        'client_id', r.client_id,
                        'typeRes', r.typeRes
                    )
                END as details
            FROM Reservation r
            LEFT JOIN Cours c ON r.id = c.reservation_id
            LEFT JOIN Location l ON r.id = l.reservation_id
            WHERE r.id = $1
        `, [id]);

        res.json(result.rows[0]);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la mise à jour de l\'activité:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Supprimer une activité
exports.deleteActivity = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query('BEGIN');

        // Supprimer les entrées dans Cours et Location
        await pool.query('DELETE FROM Cours WHERE reservation_id = $1', [id]);
        await pool.query('DELETE FROM Location WHERE reservation_id = $1', [id]);

        // Supprimer la réservation
        const result = await pool.query('DELETE FROM Reservation WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Activité non trouvée' });
        }

        await pool.query('COMMIT');
        res.json({ message: 'Activité supprimée avec succès' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la suppression de l\'activité:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Ajouter un matériel à une activité
exports.addMaterielToActivite = async (req, res) => {
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

        // Ajouter l'association
        await pool.query(
            'INSERT INTO reservation_materiel (reservation_id, materiel_id) VALUES ($1, $2)',
            [id, materielId]
        );

        // Mettre à jour le statut du matériel
        await pool.query(
            'UPDATE Materiel SET statut = $1 WHERE id = $2',
            ['En cours d\'utilisation', materielId]
        );

        res.status(200).json({ message: 'Matériel ajouté avec succès' });
    } catch (err) {
        console.error('Erreur lors de l\'ajout du matériel', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Retirer un matériel d'une activité
exports.removeMaterielFromActivite = async (req, res) => {
    const { id, materielId } = req.params;

    try {
        // Supprimer l'association
        const result = await pool.query(
            'DELETE FROM reservation_materiel WHERE reservation_id = $1 AND materiel_id = $2',
            [id, materielId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Association non trouvée' });
        }

        // Remettre le matériel comme disponible
        await pool.query(
            'UPDATE Materiel SET statut = $1 WHERE id = $2',
            ['Disponible', materielId]
        );

        res.status(200).json({ message: 'Matériel retiré avec succès' });
    } catch (err) {
        console.error('Erreur lors du retrait du matériel', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};