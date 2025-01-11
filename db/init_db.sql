-- Création des enums
CREATE TYPE ENiveau AS ENUM ('Débutant', 'Intermédiaire', 'Avancé');
CREATE TYPE EEtat AS ENUM ('Actif', 'Annulé', 'Terminé');
CREATE TYPE EType_Res AS ENUM ('Cours', 'Location');
CREATE TYPE EStatut AS ENUM ('Disponible', 'En maintenance', 'Hors service');
CREATE TYPE EType_Bateau AS ENUM ('Voilier', 'Catamaran', 'Planche à voile');
CREATE TYPE EType_Materiel AS ENUM ('Voile', 'Flotteur', 'PiedMat');

-- Création des tables --
-- Table Client
CREATE TABLE Client (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    telephone VARCHAR(255) NOT NULL,
    niveau ENiveau NOT NULL,
    quantiteForfait INT NOT NULL CHECK (quantiteForfait >= 0)
);

-- Table Compte
CREATE TABLE Compte (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL CHECK (mot_de_passe <> login)
);

-- Table Personnel
CREATE TABLE Personnel (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    telephone VARCHAR(255) NOT NULL,
    diplome VARCHAR(255) NOT NULL,
    permis VARCHAR(255) NOT NULL
);

-- Table Materiel
CREATE TABLE Materiel (
    id SERIAL PRIMARY KEY,
    statut EStatut NOT NULL,
    type EType_Materiel NOT NULL
);

-- Table Flotteur
CREATE TABLE Flotteur (
    id SERIAL PRIMARY KEY,
    capacite INT NOT NULL,
    materiel_id INT
);

-- Table Voile
CREATE TABLE Voile (
    id SERIAL PRIMARY KEY,
    taille INT NOT NULL,
    materiel_id INT
);

-- Table PiedMat
CREATE TABLE PiedMat (
    id SERIAL PRIMARY KEY,
    materiel_id INT
);

-- Table Bateau
CREATE TABLE Bateau (
    id SERIAL PRIMARY KEY,
    type EType_Bateau NOT NULL,
    materiel_id INT
);

-- Table AchatForfait
CREATE TABLE AchatForfait (
    id SERIAL PRIMARY KEY,
    quantite INT NOT NULL CHECK (quantite >= 0),
    prix INT NOT NULL CHECK (prix >= 0),
    client_id INT
);

-- Table Facture
CREATE TABLE Facture (
    id SERIAL PRIMARY KEY,
    adresse VARCHAR(255) NOT NULL,
    montant FLOAT NOT NULL CHECK (montant >= 0),
    etat EEtat NOT NULL,
    client_id INT
);

-- Table Reservation
CREATE TABLE Reservation (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    duree FLOAT NOT NULL CHECK (duree >= 0),
    typeRes EType_Res NOT NULL,
    tarif FLOAT NOT NULL,
    caution FLOAT NOT NULL,
    nbParticipants INT NOT NULL CHECK (nbParticipants > 0),
    client_id INT
);

-- Table Cours
CREATE TABLE Cours (
    id SERIAL PRIMARY KEY,
    heureDebut TIME NOT NULL,
    heureFin TIME NOT NULL CHECK (heureFin <> heureDebut),
    niveau ENiveau NOT NULL,
    etat EEtat NOT NULL,
    nbParticipants INT NOT NULL CHECK (nbParticipants <= 10),
    moniteur_id INT
);

-- Table Location
CREATE TABLE Location (
    id SERIAL PRIMARY KEY,
    heureDebut TIME NOT NULL,
    heureFin TIME NOT NULL CHECK (heureFin <> heureDebut),
    materiel_id INT,
    etat EEtat NOT NULL,
    nbParticipants INT NOT NULL CHECK (nbParticipants > 0),
    client_id INT
);

-- Table Reparation
CREATE TABLE Reparation (
    id SERIAL PRIMARY KEY,
    element VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    cout FLOAT NOT NULL,
    materiel_id INT
);

-- Table Offre
CREATE TABLE Offre (
    id SERIAL PRIMARY KEY,
    nomOffre VARCHAR(255) NOT NULL,
    prix FLOAT NOT NULL,
    quantite INT NOT NULL
);

-- Table Partenaire
CREATE TABLE Partenaire (
    id SERIAL PRIMARY KEY,
    nomCamping VARCHAR(255) NOT NULL,
    remise FLOAT NOT NULL
);

-- Table Moniteur
CREATE TABLE Moniteur (
    id SERIAL PRIMARY KEY,
    personnel_id INT
);

-- Table Proprietaire
CREATE TABLE Proprietaire (
    id SERIAL PRIMARY KEY,
    personnel_id INT
);

-- Ajout des contraintes de clés étrangères
ALTER TABLE Flotteur ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE Voile ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE PiedMat ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE Bateau ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE AchatForfait ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES Client(id);
ALTER TABLE Facture ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES Client(id);
ALTER TABLE Reservation ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES Client(id);
ALTER TABLE Cours ADD CONSTRAINT fk_moniteur FOREIGN KEY (moniteur_id) REFERENCES Personnel(id);
ALTER TABLE Location ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE Location ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES Client(id);
ALTER TABLE Reparation ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE Moniteur ADD CONSTRAINT fk_personnel FOREIGN KEY (personnel_id) REFERENCES Personnel(id);
ALTER TABLE Proprietaire ADD CONSTRAINT fk_personnel FOREIGN KEY (personnel_id) REFERENCES Personnel(id);


-- Création des rôles
-- CREATE ROLE administrateur WITH LOGIN PASSWORD 'admin_password';
CREATE ROLE proprietaire WITH LOGIN PASSWORD 'proprietaire_password';
CREATE ROLE moniteur WITH LOGIN PASSWORD 'moniteur_password';

-- Droits pour l'administrateur
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO administrateur;
GRANT CREATE, DROP ON ALL TABLES IN SCHEMA public TO administrateur;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO administrateur;

-- Droits pour le propriétaire
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO proprietaire;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO proprietaire;

-- Droits pour le moniteur
GRANT SELECT ON Cours, Materiel, Clients, AchatForfait TO moniteur;
GRANT INSERT ON Reservation, Cours, Location, Clients, Facture TO moniteur;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO moniteur;
