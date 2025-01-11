const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route de connexion
router.post('/login', authController.loginUser);

// Route de vérification du token
router.post('/verifyToken', authController.verifyToken);

module.exports = router;
