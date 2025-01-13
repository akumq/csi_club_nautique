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
        const client = await pool.connect();
        
        // Récupère le rôle de l'utilisateur
        const roleQuery = await client.query(
            'SELECT rolname FROM pg_roles WHERE rolname = $1',
            [username]
        );
        
        const userRole = roleQuery.rows[0]?.rolname || 'user';
        
        // Libère la connexion
        client.release();

        // Génère un token JWT
        const token = jwt.sign(
            { username: username, role: userRole },
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
