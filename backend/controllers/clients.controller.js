const pool = require('../database');

// Récupérer tous les client
exports.getAllClients = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nom, prenom, mail, telephone, niveau, quantiteforfait FROM client ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer un client par ID
exports.getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM client WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération du client:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Créer un nouveau client
exports.createClient = async (req, res) => {
    try {
        const { nom, prenom, mail, telephone, niveau, quantiteforfait } = req.body;
        const result = await pool.query(
            'INSERT INTO client (nom, prenom, mail, telephone, niveau, quantiteforfait) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nom, prenom, mail, telephone, niveau, quantiteforfait]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, mail, telephone, niveau, quantiteforfait } = req.body;
        
        const result = await pool.query(
            'UPDATE client SET nom = $1, prenom = $2, mail = $3, telephone = $4, niveau = $5, quantiteforfait = $6 WHERE id = $7 RETURNING *',
            [nom, prenom, mail, telephone, niveau, quantiteforfait, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du client:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM client WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }
        
        res.json({ message: 'Client supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
