FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN npm run build

# Exposer le port (utiliser une variable d'environnement)
EXPOSE 8080

# Commande pour démarrer l'application
CMD ["npm", "run", "serve"]