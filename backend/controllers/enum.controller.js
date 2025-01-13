// enum.controller.js
const pool = require('../database'); 

// Fonction pour récupérer les valeurs d'un enum depuis la base de données
async function getEnumValues(enumType) {
    try {
        const result = await pool.query(`SELECT unnest(enum_range(NULL::${enumType})) AS value`);
        return result.rows.map(row => row.value);
    } catch (err) {
        console.error(`Error fetching enum ${enumType}:`, err);
        throw new Error(`Failed to fetch enum values for ${enumType}`);
    }
}

// Contrôleur pour obtenir toutes les valeurs des enums
exports.getEnums = async (req, res) => {
    try {
        const enums = {
            ENiveau: await getEnumValues('ENiveau'),
            EEtat: await getEnumValues('EEtat'),
            EType_Res: await getEnumValues('EType_Res'),
            EStatut: await getEnumValues('EStatut'),
            EType_Bateau: await getEnumValues('EType_Bateau'),
            EType_Materiel: await getEnumValues('EType_Materiel')
        };

        res.status(200).json(enums);
    } catch (err) {
        console.error('Error fetching enums:', err);
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des enums' });
    }
};

// Exemple de contrôleur spécifique pour un enum
exports.getNiveaux = async (req, res) => {
    try {
        const niveaux = await getEnumValues('ENiveau');
        res.status(200).json(niveaux);
    } catch (err) {
        console.error('Error fetching niveaux:', err);
        res.status(500).json({ error: 'Une erreur est survenue' });
    }
};

// Ajouter une valeur à un enum
exports.addEnumValue = async (req, res) => {
    const { enumName } = req.params;
    const { value } = req.body;
    
    try {
        await pool.query(`
            ALTER TYPE ${enumName} ADD VALUE IF NOT EXISTS '${value}';
        `);
        
        res.status(200).json({ message: 'Valeur ajoutée avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la valeur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer une valeur d'un enum
exports.deleteEnumValue = async (req, res) => {
    const { enumName, value } = req.params;
    
    try {
        // Vérifier si la valeur est utilisée
        const usageCheck = await pool.query(`
            SELECT EXISTS (
                SELECT 1 
                FROM pg_catalog.pg_enum 
                WHERE enumlabel = $1 
                AND enumtypid = (
                    SELECT oid 
                    FROM pg_catalog.pg_type 
                    WHERE typname = $2
                )
            )
        `, [value, enumName.toLowerCase()]);

        if (!usageCheck.rows[0].exists) {
            return res.status(404).json({ message: 'Valeur non trouvée' });
        }

        // La suppression directe de valeurs d'enum n'est pas supportée par PostgreSQL
        // Il faut recréer le type
        await pool.query('BEGIN');
        
        // 1. Créer un nouveau type temporaire
        await pool.query(`CREATE TYPE ${enumName}_new AS ENUM (
            SELECT enumlabel::text 
            FROM pg_catalog.pg_enum 
            WHERE enumtypid = (
                SELECT oid 
                FROM pg_catalog.pg_type 
                WHERE typname = $1
            )
            AND enumlabel != $2
        )`, [enumName.toLowerCase(), value]);
        
        // 2. Mettre à jour les tables utilisant cet enum
        // Cette partie nécessite de connaître toutes les tables utilisant l'enum
        // À adapter selon votre schéma
        
        // 3. Supprimer l'ancien type et renommer le nouveau
        await pool.query(`DROP TYPE ${enumName} CASCADE`);
        await pool.query(`ALTER TYPE ${enumName}_new RENAME TO ${enumName}`);
        
        await pool.query('COMMIT');
        
        res.status(200).json({ message: 'Valeur supprimée avec succès' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la suppression de la valeur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
