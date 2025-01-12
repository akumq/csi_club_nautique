const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Test de connexion avec les identifiants fournis
        const pool = new Pool({
            user: username,
            password: password,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
        });

        // Vérifie si la connexion fonctionne
        await pool.connect();

        // Génère un token JWT
        const token = jwt.sign(
            { username: username, role: userRole }, // Stocke le rôle dans le token
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.status(200).json({
            message: 'Connexion réussie',
            token: token,
            role: userRole
        });

    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(401).json({ message: 'Identifiants invalides' });
    }
};

exports.verifyToken = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalide' });
        }

        res.status(200).json({ 
            message: 'Token valide',
            user: decoded
        });
    });
};
