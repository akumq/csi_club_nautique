const pool = require('../database');

exports.getActivites = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, 
                   c.heureDebut as cours_debut, c.heureFin as cours_fin, 
                   c.niveau, c.moniteur_id as cours_moniteur,
                   l.heureDebut as location_debut, l.heureFin as location_fin,
                   l.materiel_id, l.moniteur_id as location_moniteur,
                   array_agg(DISTINCT m.id) as materiel_ids,
                   array_agg(DISTINCT m.type) as materiel_types
            FROM Reservation r
            LEFT JOIN Cours c ON r.id = c.reservation_id
            LEFT JOIN Location l ON r.id = l.reservation_id
            LEFT JOIN reservation_materiel rm ON r.id = rm.reservation_id
            LEFT JOIN Materiel m ON rm.materiel_id = m.id
            GROUP BY r.id, c.heureDebut, c.heureFin, c.niveau, c.moniteur_id,
                     l.heureDebut, l.heureFin, l.materiel_id, l.moniteur_id
            ORDER BY r.date, COALESCE(c.heureDebut, l.heureDebut)
        `);

        const activites = result.rows.map(row => ({
            ...row,
            details: row.typeRes === 'Cours' ? {
                heureDebut: row.cours_debut,
                heureFin: row.cours_fin,
                niveau: row.niveau,
                moniteur_id: row.cours_moniteur
            } : {
                heureDebut: row.location_debut,
                heureFin: row.location_fin,
                materiel_id: row.materiel_id,
                moniteur_id: row.location_moniteur
            },
            materiels: row.materiel_ids[0] ? 
                row.materiel_ids.map((id, index) => ({
                    id: id,
                    type: row.materiel_types[index]
                })) : []
        }));

        res.status(200).json(activites);
    } catch (err) {
        console.error('Erreur lors de la récupération des activités', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer une activité par ID
exports.getActiviteById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT r.*, 
                   c.heureDebut as cours_debut, c.heureFin as cours_fin, 
                   c.niveau, c.moniteur_id as cours_moniteur,
                   l.heureDebut as location_debut, l.heureFin as location_fin,
                   l.materiel_id, l.moniteur_id as location_moniteur,
                   array_agg(DISTINCT m.id) as materiel_ids,
                   array_agg(DISTINCT m.type) as materiel_types
            FROM Reservation r
            LEFT JOIN Cours c ON r.id = c.reservation_id
            LEFT JOIN Location l ON r.id = l.reservation_id
            LEFT JOIN reservation_materiel rm ON r.id = rm.reservation_id
            LEFT JOIN Materiel m ON rm.materiel_id = m.id
            WHERE r.id = $1
            GROUP BY r.id, c.heureDebut, c.heureFin, c.niveau, c.moniteur_id,
                     l.heureDebut, l.heureFin, l.materiel_id, l.moniteur_id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activité non trouvée' });
        }

        const activite = {
            ...result.rows[0],
            details: result.rows[0].typeRes === 'Cours' ? {
                heureDebut: result.rows[0].cours_debut,
                heureFin: result.rows[0].cours_fin,
                niveau: result.rows[0].niveau,
                moniteur_id: result.rows[0].cours_moniteur
            } : {
                heureDebut: result.rows[0].location_debut,
                heureFin: result.rows[0].location_fin,
                materiel_id: result.rows[0].materiel_id,
                moniteur_id: result.rows[0].location_moniteur
            },
            materiels: result.rows[0].materiel_ids[0] ? 
                result.rows[0].materiel_ids.map((id, index) => ({
                    id: id,
                    type: result.rows[0].materiel_types[index]
                })) : []
        };

        res.status(200).json(activite);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'activité', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Créer une nouvelle activité
exports.createActivite = async (req, res) => {
    const { date, duree, typeRes, tarif, caution, nbParticipants, client_id, details } = req.body;
    
    try {
        await pool.query('BEGIN');

        // Créer la réservation de base
        const reservationResult = await pool.query(
            'INSERT INTO Reservation (date, duree, typeRes, tarif, caution, nbParticipants, client_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [date, duree, typeRes, tarif, caution, nbParticipants, client_id]
        );

        const activiteId = reservationResult.rows[0].id;

        // Créer l'entrée spécifique selon le type
        if (typeRes === 'Cours') {
            await pool.query(
                'INSERT INTO Cours (heureDebut, heureFin, niveau, etat, nbParticipants, moniteur_id, reservation_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [details.heureDebut, details.heureFin, details.niveau, 'Actif', nbParticipants, details.moniteur_id, activiteId]
            );
        } else if (typeRes === 'Location') {
            await pool.query(
                'INSERT INTO Location (heureDebut, heureFin, materiel_id, etat, nbParticipants, client_id, reservation_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [details.heureDebut, details.heureFin, details.materiel_id, 'Actif', nbParticipants, client_id, activiteId]
            );
        }

        // Ajouter les matériels associés
        if (req.body.materiels && req.body.materiels.length > 0) {
            for (const materielId of req.body.materiels) {
                await pool.query(
                    'INSERT INTO reservation_materiel (reservation_id, materiel_id) VALUES ($1, $2)',
                    [activiteId, materielId]
                );
            }
        }

        await pool.query('COMMIT');

        // Récupérer l'activité complète
        const newActivite = await this.getActiviteById(req, res);
        return newActivite;

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la création de l\'activité', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Mettre à jour une activité
exports.updateActivite = async (req, res) => {
    const { id } = req.params;
    const { date, duree, typeRes, tarif, caution, nbParticipants, client_id, details } = req.body;
    
    try {
        await pool.query('BEGIN');

        // Mettre à jour la réservation de base
        await pool.query(
            'UPDATE Reservation SET date = $1, duree = $2, typeRes = $3, tarif = $4, caution = $5, nbParticipants = $6, client_id = $7 WHERE id = $8',
            [date, duree, typeRes, tarif, caution, nbParticipants, client_id, id]
        );

        // Mettre à jour l'entrée spécifique selon le type
        if (typeRes === 'Cours') {
            await pool.query(
                'UPDATE Cours SET heureDebut = $1, heureFin = $2, niveau = $3, moniteur_id = $4 WHERE reservation_id = $5',
                [details.heureDebut, details.heureFin, details.niveau, details.moniteur_id, id]
            );
        } else if (typeRes === 'Location') {
            await pool.query(
                'UPDATE Location SET heureDebut = $1, heureFin = $2, materiel_id = $3, client_id = $4 WHERE reservation_id = $5',
                [details.heureDebut, details.heureFin, details.materiel_id, client_id, id]
            );
        }

        await pool.query('COMMIT');

        // Récupérer et renvoyer l'activité mise à jour
        const updatedActivite = await this.getActiviteById(req, res);
        return updatedActivite;

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la mise à jour de l\'activité', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer une activité
exports.deleteActivite = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query('BEGIN');

        // Supprimer les associations avec les matériels
        await pool.query('DELETE FROM reservation_materiel WHERE reservation_id = $1', [id]);

        // Supprimer l'entrée dans Cours ou Location
        await pool.query('DELETE FROM Cours WHERE reservation_id = $1', [id]);
        await pool.query('DELETE FROM Location WHERE reservation_id = $1', [id]);

        // Supprimer la réservation
        const result = await pool.query('DELETE FROM Reservation WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Activité non trouvée' });
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Activité supprimée avec succès' });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la suppression de l\'activité', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
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

// ... autres méthodes du contrôleur ... 