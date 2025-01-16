const express = require('express');
const fs = require('fs');
const path = require("path");
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

// ... autres routes

// Routes
const clientsRoutes = require('./routes/clients.routes');
const authRoutes = require('./routes/auth.routes');
const personnelsRoutes = require('./routes/personnels.routes');
const locationsRouter = require('./routes/locations.routes');
const enumRoutes = require('./routes/enum.routes');
const materielRoutes = require('./routes/materiels.routes');
const offresRoutes = require('./routes/offres.routes');
const activitiesRoutes = require('./routes/activities.routes');
const partenairesRoutes = require('./routes/partenaires.routes');
const reparationsRoutes = require('./routes/reparations.routes');

// Auth
const { authorizeRole } = require('./middleware/auth');

const app = express();

// Configuration CORS
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:3001'
  ],
  credentials: true
}));

// Autres middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes API
app.use('/api/clients', clientsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/personnels', personnelsRoutes);
app.use('/api/locations', locationsRouter);
app.use('/api/enum', enumRoutes);
app.use('/api/materiels', materielRoutes);
app.use('/api/offres', offresRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/partenaires', partenairesRoutes);
app.use('/api/reparations', reparationsRoutes);

// server
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
