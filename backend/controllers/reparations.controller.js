const pool = require('../database');

// Récupérer toutes les réparations
exports.getRepairs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, m.type AS materiel_type
            FROM Reparation r
            JOIN Materiel m ON r.materiel_id = m.id
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des réparations', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Créer une nouvelle réparation
exports.createRepair = async (req, res) => {
    const { element, description, dateDebut, dateFin, cout, materiel_id } = req.body;

    // Validation des champs requis
    if (!element || !description || !dateDebut || !cout || !materiel_id) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    try {
        // Créer la réparation
        const result = await pool.query(`
            INSERT INTO Reparation (element, description, dateDebut, dateFin, cout, materiel_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [element, description, dateDebut, dateFin, cout, materiel_id]);

        // Mettre à jour l'état du matériel
        await pool.query(`
            UPDATE Materiel
            SET statut = 'En maintenance'
            WHERE id = $1
        `, [materiel_id]);

        res.status(201).json({ message: 'Réparation créée avec succès', id: result.rows[0].id });
    } catch (err) {
        console.error('Erreur lors de la création de la réparation', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer une réparation
exports.deleteRepair = async (req, res) => {
    const { id } = req.params;

    try {
        // Récupérer l'ID du matériel associé à la réparation
        const repairResult = await pool.query('SELECT materiel_id FROM Reparation WHERE id = $1', [id]);
        if (repairResult.rows.length === 0) {
            return res.status(404).json({ error: 'Réparation non trouvée' });
        }
        const materiel_id = repairResult.rows[0].materiel_id;

        // Supprimer la réparation
        await pool.query('DELETE FROM Reparation WHERE id = $1', [id]);

        // Mettre à jour l'état du matériel
        await pool.query(`
            UPDATE Materiel
            SET statut = 'Disponible'
            WHERE id = $1
        `, [materiel_id]);

        res.status(200).json({ message: 'Réparation supprimée avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression de la réparation', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
}; 