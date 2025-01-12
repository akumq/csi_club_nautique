const express = require('express');
const fs = require('fs');
const path = require("path");
const bodyParser = require('body-parser');

require('dotenv').config();

// Routes
const clientsRoutes = require('./routes/clients.routes');
const authRoutes = require('./routes/auth.routes');
const personnelsRoutes = require('./routes/personnels.routes');
const activitesRoutes = require('./routes/activites.routes');
const locationsRouter = require('./routes/locations.routes');
const enumRoutes = require('./routes/enum.routes');
const materielRoutes = require('./routes/materiels.routes');

// Auth
const { authorizeRole } = require('./middleware/auth');

const app = express();

// Chemins corrects depuis le workdir
app.use("/static", express.static(path.join(__dirname, "/frontend", "static")));
app.use("/frontend", express.static(path.join(__dirname, "/frontend")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use('/api/clients', clientsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/personnels', personnelsRoutes);
app.use('/api/activites', activitesRoutes);
app.use('/api/locations', locationsRouter);
app.use('/api/enum', enumRoutes);
app.use('/api/materiels', materielRoutes);

// server
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend', 'dashboard.html'));
});

// Route pour servir tous les fichiers html
app.get("/*", (req, res, next) => {
    let requestedFile = req.params[0];  // Capture le chemin après "/" (par exemple, "about")
    
    // Ajouter l'extension .html si elle n'est pas présente
    if (!requestedFile.endsWith('.html')) {
        requestedFile += '.html';
    }

    const filePath = path.join(__dirname, "/frontend", requestedFile);

    // Vérifie si le fichier demandé existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
            // Si le fichier existe, on le renvoie
            res.sendFile(filePath);
        } else {
            // Si le fichier n'existe pas, on redirige vers la page 404
            res.status(404).sendFile(path.join(__dirname, '/frontend', '404.html'));
        }
    });
});