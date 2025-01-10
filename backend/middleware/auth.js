
const jwt = require('jsonwebtoken');
const pool = require('../database'); 

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }

        req.user = user; // Assurez-vous que `user` contient bien les informations nécessaires
        console.log('Authenticated user:', req.user); // Log pour vérifier
        next();
    });
};

// Middleware pour vérifier le rôle
exports.authorizeRole = (roles) => async (req, res, next) => {
    const { username } = req.user;

    try {
        const userResult = await pool.query('SELECT * FROM pg_roles WHERE rolname = $1', [username]);

        if (!userResult.rows.length) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        if (!roles.includes(username)) {
            return res.status(403).json({ message: 'Accès refusé: Rôle non autorisé' });
        }

        next();
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la vérification de l\'utilisateur' });
    }
};
