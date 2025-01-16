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

// Ajouter cette nouvelle méthode
exports.achatForfait = async (req, res) => {
    const { client_id, offre_id, adresse, partenaire_id } = req.body;

    try {
        let partenaire = null;
        const partenaireResult = await pool.query('SELECT * FROM Partenaire WHERE id = $1', [partenaire_id]);
        if (partenaireResult.rows.length > 0) {
            partenaire = partenaireResult.rows[0];
        }

        // Vérifier que l'offre existe et récupérer ses informations
        const offreResult = await pool.query('SELECT * FROM Offre WHERE id = $1', [offre_id]);
        if (offreResult.rows.length === 0) {
            return res.status(404).json({ error: 'Offre non trouvée' });
        }
        const offre = offreResult.rows[0];

        // Calculer le montant après réduction si partenaire est défini
        let montant = offre.prix;
        if (partenaire) {
            montant *= (1 - partenaire.remise); // Appliquer la réduction
        }

        // Démarrer une transaction
        await pool.query('BEGIN');

        // Créer la facture
        const factureResult = await pool.query(
            'INSERT INTO Facture (client_id, montant, adresse, etat) VALUES ($1, $2, $3, $4) RETURNING id',
            [client_id, montant, adresse, 'Actif']
        );
        const factureId = factureResult.rows[0].id;

        // Mettre à jour la quantité de forfait du client
        await pool.query(
            'UPDATE Client SET quantiteForfait = quantiteForfait + $1 WHERE id = $2',
            [offre.quantite, client_id]
        );

        // Créer l'achat de forfait avec référence à l'offre
        await pool.query(
            'INSERT INTO AchatForfait (client_id, facture_id, nomOffre, quantite, prix) VALUES ($1, $2, $3, $4, $5)',
            [client_id, factureId, offre.nomoffre, offre.quantite, montant] // Utiliser le montant après réduction
        );

        // Valider la transaction
        await pool.query('COMMIT');

        res.status(200).json({ message: 'Forfait acheté avec succès' });
    } catch (err) {
        // En cas d'erreur, annuler la transaction
        await pool.query('ROLLBACK');
        console.error('Erreur lors de l\'achat du forfait:', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Récupérer les factures d'un client
exports.getClientFactures = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(`
            SELECT f.id, f.montant, f.date_facture, f.etat,
                   af.nomOffre, af.quantite, af.prix
            FROM Facture f
            LEFT JOIN AchatForfait af ON f.id = af.facture_id
            WHERE f.client_id = $1
            ORDER BY f.date_facture DESC
        `, [id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
