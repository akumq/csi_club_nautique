const pool = require('../database');

// Récupérer tous les personnels (moniteurs et propriétaires)
exports.getPersonnels = async (req, res) => {
    try {
        const { type } = req.query;

        let query;
        let params = [];

        if (type === 'moniteur') {
            query = `
                SELECT p.*, 'moniteur' as type
                FROM Personnel p
                INNER JOIN Moniteur m ON p.id = m.personnel_id
            `;
        } else if (type === 'proprietaire') {
            query = `
                SELECT p.*, 'proprietaire' as type
                FROM Personnel p
                INNER JOIN Proprietaire pr ON p.id = pr.personnel_id
            `;
        } else {
            query = `
                SELECT Personnel.*, 
                    CASE 
                        WHEN Moniteur.personnel_id IS NOT NULL THEN 'moniteur' 
                        WHEN Proprietaire.personnel_id IS NOT NULL THEN 'proprietaire' 
                        ELSE 'inconnu' 
                    END AS type
                FROM Personnel
                LEFT JOIN Moniteur ON Personnel.id = Moniteur.personnel_id
                LEFT JOIN Proprietaire ON Personnel.id = Proprietaire.personnel_id
            `;
        }

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des personnels', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer un personnel par ID
exports.getPersonnelById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT Personnel.*, 
                   CASE 
                       WHEN Moniteur.personnel_id IS NOT NULL THEN 'moniteur' 
                       WHEN Proprietaire.personnel_id IS NOT NULL THEN 'proprietaire' 
                       ELSE 'inconnu' 
                   END AS type
            FROM Personnel
            LEFT JOIN Moniteur ON Personnel.id = Moniteur.personnel_id
            LEFT JOIN Proprietaire ON Personnel.id = Proprietaire.personnel_id
            WHERE Personnel.id = $1
        `, [id]);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Personnel non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du personnel', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Créer un nouveau personnel
exports.createPersonnel = async (req, res) => {
    const { nom, prenom, mail, adresse, telephone, diplome, permis, type } = req.body; // Assurez-vous que l'adresse est incluse

    // Vérification que tous les champs requis sont présents
    if (!nom || !prenom || !mail || !adresse || !telephone || !diplome || !permis || !type) {
        return res.status(400).json({ error: 'Tous les champs doivent être remplis' });
    }

    try {
        // Insérer dans la table Personnel
        const personnelResult = await pool.query(
            'INSERT INTO Personnel (nom, prenom, mail, adresse, telephone, diplome, permis) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [nom, prenom, mail, adresse, telephone, diplome, permis]
        );

        const personnelId = personnelResult.rows[0].id;

        // Insérer dans la table appropriée (Moniteur ou Propriétaire)
        if (type === 'moniteur') {
            await pool.query('INSERT INTO Moniteur (personnel_id) VALUES ($1)', [personnelId]);
        } else if (type === 'proprietaire') {
            await pool.query('INSERT INTO Proprietaire (personnel_id) VALUES ($1)', [personnelId]);
        }

        res.status(201).json({ id: personnelId, nom, prenom, mail, adresse, telephone, diplome, permis, type });
    } catch (err) {
        console.error('Erreur lors de la création du personnel', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Mettre à jour un personnel
exports.updatePersonnel = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, mail, adresse, telephone, diplome, permis } = req.body; // Assurez-vous que l'adresse est incluse

    try {
        // Mettre à jour les informations dans la table Personnel
        const result = await pool.query(
            'UPDATE Personnel SET nom = $1, prenom = $2, mail = $3, adresse = $4, telephone = $5, diplome = $6, permis = $7 WHERE id = $8 RETURNING *',
            [nom, prenom, mail, adresse, telephone, diplome, permis, id]
        );

        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Personnel non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour du personnel', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer un personnel
exports.deletePersonnel = async (req, res) => {
    const { id } = req.params;

    try {
        // Supprimer l'entrée dans Personnel
        const personnelResult = await pool.query('DELETE FROM Personnel WHERE id = $1 RETURNING *', [id]);

        if (personnelResult.rows.length === 0) {
            return res.status(404).json({ message: 'Personnel non trouvé' });
        }

        // Supprimer les entrées correspondantes dans Moniteur et Propriétaire
        await pool.query('DELETE FROM Moniteur WHERE personnel_id = $1', [id]);
        await pool.query('DELETE FROM Proprietaire WHERE personnel_id = $1', [id]);

        res.status(200).json({ message: 'Personnel supprimé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression du personnel', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};