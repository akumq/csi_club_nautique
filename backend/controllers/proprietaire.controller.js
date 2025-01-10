const pool = require('../database');

// Récupérer tous les moniteurs
exports.getProprietaires = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Proprietaire INNER JOIN Personnel ON Proprietaire.personnel_id = Personnel.id');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des Proprietaires', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer un moniteur par ID
exports.getProprietaireById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM Proprietaire INNER JOIN Personnel ON Proprietaire.personnel_id = Personnel.id WHERE Proprietaire.id = $1',
            [id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Proprietaire non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du Proprietaires', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Créer un nouveau moniteur
exports.createProprietaire = async (req, res) => {
    const { nom, prenom, mail, adresse, telephone, diplome, permis } = req.body;
    try {
        // Insérer dans la table Personnel
        const personnelResult = await pool.query(
            'INSERT INTO Personnel (nom, prenom, mail, adresse, telephone, diplome, permis) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [nom, prenom, mail, adresse, telephone, diplome, permis]
        );

        const personnelId = personnelResult.rows[0].id;

        // Insérer dans la table Moniteur
        const moniteurResult = await pool.query(
            'INSERT INTO Proprietaire (personnel_id) VALUES ($1) RETURNING *',
            [personnelId]
        );

        res.status(201).json(moniteurResult.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la création du proprietaire', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Mettre à jour un moniteur
exports.updateMoniteur = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, mail, adresse, telephone, diplome, permis } = req.body;

    try {
        // Mettre à jour les informations dans la table Personnel
        const result = await pool.query(
            'UPDATE Personnel SET nom = $1, prenom = $2, mail = $3, adresse = $4, telephone = $5, diplome = $6, permis = $7 WHERE id = (SELECT personnel_id FROM Proprietaire WHERE id = $8) RETURNING *',
            [nom, prenom, mail, adresse, telephone, diplome, permis, id]
        );

        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'proprietaire non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour du proprietaire', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer un moniteur
exports.deleteProprietaire = async (req, res) => {
    const { id } = req.params;

    try {
        // Supprimer l'entrée dans Moniteur
        const moniteurResult = await pool.query(
            'DELETE FROM Proprietaire WHERE id = $1 RETURNING personnel_id',
            [id]
        );

        if (moniteurResult.rows.length === 0) {
            return res.status(404).json({ message: 'Proprietaire non trouvé' });
        }

        const personnelId = moniteurResult.rows[0].personnel_id;

        // Supprimer l'entrée correspondante dans Personnel
        await pool.query('DELETE FROM Personnel WHERE id = $1', [personnelId]);

        res.status(200).json({ message: 'Proprietaire supprimé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression du Proprietaire', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};
