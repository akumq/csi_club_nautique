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
