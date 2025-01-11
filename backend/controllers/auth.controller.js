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
        const roleResult = await pool.query('SELECT CURRENT_USER');
        const currentUser = roleResult.rows[0].current_user;

        // Génère un token JWT
        const token = jwt.sign({ username: currentUser }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            message: 'Connexion réussie', 
            token, 
            currentUser 
        });

    } catch (error) {
        console.error('Erreur de connexion :', error.message);
        res.status(401).json({ message: 'Identifiants incorrects ou permission refusée' });
    }
};

// Fonction de vérification du token
exports.verifyToken = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }

        res.status(200).json({ message: 'Token valide' });
    });
};
