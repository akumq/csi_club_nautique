-- Création des enums
CREATE TYPE ENiveau AS ENUM ('Débutant', 'Intermédiaire', 'Avancé');
CREATE TYPE EEtat AS ENUM ('Actif', 'Annulé', 'Terminé');
CREATE TYPE EType_Res AS ENUM ('Cours', 'Location');
CREATE TYPE EStatut AS ENUM ('Disponible', 'En maintenance', 'Hors service', 'Réservé');
CREATE TYPE EType_Bateau AS ENUM ('Pedalo','Paddle', 'Catamaran', 'Planche à voile', 'Hors-bord');
CREATE TYPE EType_Materiel AS ENUM ('Voile', 'Flotteur', 'PiedMat', 'Bateau');

-- Création des tables sans les clés étrangères

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

-- Table Facture
CREATE TABLE Facture (
    id SERIAL PRIMARY KEY,
    adresse VARCHAR(255) NOT NULL,
    montant FLOAT NOT NULL CHECK (montant >= 0),
    etat EEtat NOT NULL,
    date_facture TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    client_id INT
);

-- Table AchatForfait
CREATE TABLE AchatForfait (
    id SERIAL PRIMARY KEY,
    facture_id INT,
    nomOffre VARCHAR(255) NOT NULL,
    quantite INT NOT NULL CHECK (quantite >= 0),
    prix FLOAT NOT NULL CHECK (prix >= 0),
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
    moniteur_id INT,
    reservation_id INT
);

-- Table Location
CREATE TABLE Location (
    id SERIAL PRIMARY KEY,
    heureDebut TIME NOT NULL,
    heureFin TIME NOT NULL CHECK (heureFin <> heureDebut),
    materiel_id INT,
    etat EEtat NOT NULL,
    nbParticipants INT NOT NULL CHECK (nbParticipants > 0),
    client_id INT,
    reservation_id INT
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

-- Ajout des contraintes de clés étrangères à la fin
ALTER TABLE Flotteur ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE Voile ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE PiedMat ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE Bateau ADD CONSTRAINT fk_materiel FOREIGN KEY (materiel_id) REFERENCES Materiel(id);
ALTER TABLE AchatForfait ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES Client(id);
ALTER TABLE AchatForfait ADD CONSTRAINT fk_facture_id FOREIGN KEY (facture_id) REFERENCES Facture(id);
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
GRANT ALL PRIVILEGES ON SCHEMA public TO administrateur;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO administrateur;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO administrateur;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO administrateur;

-- Droits pour le propriétaire
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO proprietaire;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO proprietaire;

-- Droits pour le moniteur
GRANT SELECT ON Cours, Materiel, Client, AchatForfait TO moniteur;
GRANT INSERT ON Reservation, Cours, Location, Client, Facture TO moniteur;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO moniteur;

-- Ajouter cette ligne pour permettre à l'administrateur de créer des objets
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO administrateur;

--TRIGGERS

--Vérifier le niveau du client pour le cours
CREATE OR REPLACE FUNCTION verifier_niveau_cours() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.niveau <> (SELECT niveau FROM Client WHERE id = NEW.client_id) THEN
        RAISE EXCEPTION 'Le niveau du client ne correspond pas au niveau du cours';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verifier_niveau_cours
BEFORE INSERT OR UPDATE ON Cours
FOR EACH ROW
EXECUTE FUNCTION verifier_niveau_cours();

--Vérifier que le matériel est disponible pour une location
CREATE OR REPLACE FUNCTION verifier_disponibilite_materiel() RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT statut FROM Materiel WHERE id = NEW.materiel_id) <> 'Disponible' THEN
        RAISE EXCEPTION 'Le matériel n''est pas disponible pour la location';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verifier_disponibilite_materiel
BEFORE INSERT OR UPDATE ON Location
FOR EACH ROW
EXECUTE FUNCTION verifier_disponibilite_materiel();

--Mettre le à jour le matériel disponible après une réparation
CREATE OR REPLACE FUNCTION mettre_a_jour_statut_materiel() RETURNS TRIGGER AS $$
BEGIN
    UPDATE Materiel
    SET statut = 'Disponible'
    WHERE id = NEW.materiel_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mettre_a_jour_statut_materiel
AFTER UPDATE ON Reparation
FOR EACH ROW
WHEN (OLD.dateFin IS DISTINCT FROM NEW.dateFin AND NEW.dateFin IS NOT NULL)
EXECUTE FUNCTION mettre_a_jour_statut_materiel();

--Mettre le matériel à réservé lorsqu'il est ajouté à un cours ou à une location
CREATE OR REPLACE FUNCTION changer_statut_materiel_reservation() RETURNS TRIGGER AS $$
BEGIN
    UPDATE Materiel
    SET statut = 'Réservé'
    WHERE id = NEW.materiel_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER changer_statut_materiel_cours
BEFORE INSERT ON Cours
FOR EACH ROW
EXECUTE FUNCTION changer_statut_materiel_reservation();

CREATE TRIGGER changer_statut_materiel_location
BEFORE INSERT ON Location
FOR EACH ROW
EXECUTE FUNCTION changer_statut_materiel_reservation();

-- Vérifier qu'on ne peut pas louer le hors-bord
CREATE OR REPLACE FUNCTION verifier_type_bateau_location() RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT type FROM Bateau WHERE id = NEW.materiel_id) = 'Hors-bord' THEN
        RAISE EXCEPTION 'Impossible de louer un bateau de type Hors-bord';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verifier_type_bateau_location
BEFORE INSERT OR UPDATE ON Location
FOR EACH ROW
EXECUTE FUNCTION verifier_type_bateau_location();
