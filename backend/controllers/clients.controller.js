const pool = require('../database'); 
// Récupérer tous les client
exports.getClients = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM client');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des client', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer un client par ID
exports.getClientById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM client WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Client non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du client', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Créer un nouveau client
exports.createClient = async (req, res) => {
    console.log(req.body);
    const { nom, prenom, mail, telephone, niveau, quantiteForfait } = req.body;
    quantiteForfait = parseInt(quantiteForfait, 10); 
    // Vérification que tous les champs sont présents
    if (!nom || !prenom || !mail || !telephone || !niveau || quantiteForfait === undefined) {
        return res.status(400).json({ error: 'Tous les champs doivent être remplis' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO client (nom, prenom, mail, telephone, niveau, quantiteForfait) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nom, prenom, mail, telephone, niveau, quantiteForfait]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la création du client', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};


// Mettre à jour un client
exports.updateClient = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, mail, telephone, niveau, quantiteForfait } = req.body;
    try {
        const result = await pool.query(
            'UPDATE client SET nom = $1, prenom = $2, mail = $3, telephone = $4, niveau = $5, quantiteForfait = $6 WHERE id = $7 RETURNING *',
            [nom, prenom, mail, telephone, niveau, quantiteForfait, id]
        );
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Client non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la mise à jour du client', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM client WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Client supprimé avec succès' });
        } else {
            res.status(404).json({ message: 'Client non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la suppression du client', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};
