const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');

require('dotenv').config();

// Routes 
const clientsRoutes = require('./routes/clients.routes');
const authRoutes = require('./routes/auth.routes')
const moniteurRoutes = require('./routes/moniteurs.routes')
const proprietaireRoutes = require('./routes/proprietaire.routes')
const coursRouter = require('./routes/cours.routes')
const reservationsRouter = require('./routes/reservations.routes')
const locationsRouter = require('./routes/locations.routes')

// Auth
const { authorizeRole } = require('./middleware/auth');

const app = express();

// Chemins corrects depuis le workdir
app.use("/static", express.static(path.join(__dirname, "/frontend", "static")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use('/api/clients', clientsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/moniteurs', moniteurRoutes);
app.use('/api/proprietaires', proprietaireRoutes);
app.use('/api/cours', coursRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/locations', locationsRouter);
// server
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});


// index.html
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend", "index.html"));
});
