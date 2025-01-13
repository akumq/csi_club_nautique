const pool = require('../database');

// Récupérer tous les matériels avec leurs types
exports.getMateriels = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.id, m.statut, m.type, f.capacite, v.taille, b.type AS bateau_type
            FROM Materiel m
            LEFT JOIN Flotteur f ON f.materiel_id = m.id
            LEFT JOIN Voile v ON v.materiel_id = m.id
            LEFT JOIN Bateau b ON b.materiel_id = m.id;
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des matériels', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer un matériel par ID
exports.getMaterielById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT m.id, m.statut, m.type, v.taille, f.capacite, b.type AS bateau_type
            FROM Materiel m
            LEFT JOIN Voile v ON m.id = v.materiel_id
            LEFT JOIN Flotteur f ON m.id = f.materiel_id
            LEFT JOIN PiedMat p ON m.id = p.materiel_id
            LEFT JOIN Bateau b ON m.id = b.materiel_id
            WHERE m.id = $1
        `, [id]);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Matériel non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du matériel', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Créer un nouveau matériel
exports.createMateriel = async (req, res) => {
    const { statut, type, taille, capacite, bateau_type } = req.body;
    console.log(bateau_type);

    // Validation des champs requis
    if (!statut || !type) {
        return res.status(400).json({ error: "Le statut et le type sont obligatoires" });
    }

    try {
        // Insertion du matériel principal
        const result = await pool.query(`
            INSERT INTO Materiel (statut, type)
            VALUES ($1, $2)
            RETURNING id
        `, [statut, type]);

        const materielId = result.rows[0].id;

        // Ajout des informations spécifiques au type de matériel
        if (type === 'Voile') {
            if (taille === undefined) {
                return res.status(400).json({ error: "La taille est requise pour une voile" });
            }
            await pool.query('INSERT INTO Voile (taille, materiel_id) VALUES ($1, $2)', [taille, materielId]);
        } else if (type === 'Flotteur') {
            if (capacite === undefined) {
                return res.status(400).json({ error: "La capacité est requise pour un flotteur" });
            }
            await pool.query('INSERT INTO Flotteur (capacite, materiel_id) VALUES ($1, $2)', [capacite, materielId]);
        } else if (type === 'Bateau') {
            console.log(bateau_type);
            if (!bateau_type) {
                return res.status(400).json({ error: "Le type de bateau est requis" });
            }
            // Insertion du type "Bateau" dans la table Materiel
            await pool.query('INSERT INTO Bateau (type, materiel_id) VALUES ($1, $2)', [bateau_type, materielId]);
        } else if (type === 'PiedMat') {
            await pool.query('INSERT INTO PiedMat (materiel_id) VALUES ($1)', [materielId]);
        } else {
            return res.status(400).json({ error: "Type de matériel invalide" });
        }

        res.status(201).json({ message: 'Matériel créé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la création du matériel', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};


// Mettre à jour un matériel
exports.updateMateriel = async (req, res) => {
    const { id } = req.params;
    const { statut, type, taille, capacite, bateau_type } = req.body;

    try {
        // Vérifier si le matériel existe
        const checkMateriel = await pool.query('SELECT * FROM Materiel WHERE id = $1', [id]);
        if (checkMateriel.rows.length === 0) {
            return res.status(404).json({ message: 'Matériel non trouvé' });
        }

        // Commencer une transaction
        await pool.query('BEGIN');

        // Mettre à jour le matériel principal
        const result = await pool.query(`
            UPDATE Materiel
            SET statut = $1, type = $2
            WHERE id = $3
            RETURNING id
        `, [statut, type, id]);

        const materielId = result.rows[0].id;

        // Mettre à jour ou insérer les données spécifiques selon le type
        if (type === 'Voile') {
            await pool.query(`
                INSERT INTO Voile (taille, materiel_id) 
                VALUES ($1, $2)
                ON CONFLICT (materiel_id) 
                DO UPDATE SET taille = $1
            `, [taille, materielId]);
        } else if (type === 'Flotteur') {
            await pool.query(`
                INSERT INTO Flotteur (capacite, materiel_id) 
                VALUES ($1, $2)
                ON CONFLICT (materiel_id) 
                DO UPDATE SET capacite = $1
            `, [capacite, materielId]);
        } else if (type === 'Bateau') {
            await pool.query(`
                INSERT INTO Bateau (type, materiel_id) 
                VALUES ($1, $2)
                ON CONFLICT (materiel_id) 
                DO UPDATE SET type = $1
            `, [bateau_type, materielId]);
        } else if (type === 'PiedMat') {
            await pool.query(`
                INSERT INTO PiedMat (materiel_id) 
                VALUES ($1)
                ON CONFLICT (materiel_id) DO NOTHING
            `, [materielId]);
        }

        // Valider la transaction
        await pool.query('COMMIT');

        res.status(200).json({ message: 'Matériel mis à jour' });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du matériel', err);
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer un matériel
exports.deleteMateriel = async (req, res) => {
    const { id } = req.params;
    try {
        // Supprimer les références dans les tables associées (Flotteur, Voile, Bateau, PiedMat)
        await pool.query('DELETE FROM Flotteur WHERE materiel_id = $1', [id]);
        await pool.query('DELETE FROM Voile WHERE materiel_id = $1', [id]);
        await pool.query('DELETE FROM Bateau WHERE materiel_id = $1', [id]);
        await pool.query('DELETE FROM PiedMat WHERE materiel_id = $1', [id]);

        // Supprimer le matériel principal
        const result = await pool.query('DELETE FROM Materiel WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Matériel supprimé avec succès' });
        } else {
            res.status(404).json({ message: 'Matériel non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la suppression du matériel', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};
