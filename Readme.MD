# Club Nautique - Gestion de Réservations

## Description

Le projet **Club Nautique** est une application de gestion pour un club nautique, permettant de gérer les réservations d'activités, les clients, le personnel, les matériels, et les offres. L'application est construite avec une architecture basée sur **Vue.js** pour le frontend et **Node.js** avec **Express** pour le backend, utilisant **PostgreSQL** comme base de données.

## Fonctionnalités

- **Gestion des Clients** : Ajouter, modifier, supprimer et consulter les informations des clients.
- **Gestion des Activités** : Créer, modifier et supprimer des activités (cours et locations).
- **Gestion du Personnel** : Gérer les informations des moniteurs et propriétaires.
- **Gestion des Matériels** : Suivre l'état et la disponibilité des matériels.
- **Gestion des Offres** : Créer et gérer des offres spéciales pour les clients.
- **Achat de Forfaits** : Permettre aux clients d'acheter des forfaits pour des activités.
- **Facturation** : Générer des factures pour les achats de forfaits.

## Technologies Utilisées

- **Frontend** : Vue.js, Vue Router, Vuex, Bootstrap, Font Awesome
- **Backend** : Node.js, Express, PostgreSQL
- **Outils de Développement** : Docker, Nodemon, ESLint

## Installation

### Prérequis

- Node.js
- PostgreSQL
- Docker (optionnel)

### Cloner le dépôt

```bash
git clone https://github.com/akumq/csi_club_nautique.git
cd club-nautique
```

### Configuration de l'environnement

1. Créez un fichier `.env` dans le dossier `backend` et remplissez-le avec les informations de votre base de données :

```
PORT=3000
DB_USER=administrateur
DB_PASSWORD=admin_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=club_nautique
JWT_SECRET=your_jwt_secret
```

2. Créez un fichier `.env` dans le dossier `frontend` :

```
VUE_API_URL=http://localhost:3000
```

### Lancer l'application

#### Avec Docker

1. Assurez-vous que Docker est installé et en cours d'exécution.
2. Dans le répertoire du projet, exécutez :

```bash
docker-compose up --build
```

#### Sans Docker

1. Installez les dépendances pour le backend :

```bash
cd backend
npm install
```

2. Démarrez le serveur backend :

```bash
npm run dev
```

3. Installez les dépendances pour le frontend :

```bash
cd ../frontend
npm install
```

4. Démarrez le serveur frontend :

```bash
npm run serve
```

## Utilisation

- Accédez à l'application via `http://localhost:3001` dans votre navigateur.
- Connectez-vous avec les identifiants d'un utilisateur administrateur ou propriétaire pour accéder à toutes les fonctionnalités.

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à soumettre des problèmes ou des demandes de fonctionnalités.

## License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteurs

- Amadou Maxime Maxence Eric