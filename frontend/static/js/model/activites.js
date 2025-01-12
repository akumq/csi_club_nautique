class Activite {
    #id;
    #date;
    #duree;
    #typeActivite;
    #tarif;
    #caution;
    #nbParticipants;
    #clientId;
    #apiClient;
    #materiels;

    constructor(data, apiClient) {
        if (this.constructor === Activite) {
            throw new Error("Activite est une classe abstraite");
        }
        
        const { id, date, duree, typeRes: typeActivite, tarif, caution, nbParticipants, client_id } = data;
        this.#id = id;
        this.#date = date;
        this.#duree = duree;
        this.#typeActivite = typeActivite;
        this.#tarif = tarif;
        this.#caution = caution;
        this.#nbParticipants = nbParticipants;
        this.#clientId = client_id;
        this.#apiClient = apiClient;
        this.#materiels = data.materiels || [];
    }

    // Getters communs
    get id() { return this.#id; }
    get date() { return this.#date; }
    get duree() { return this.#duree; }
    get typeActivite() { return this.#typeActivite; }
    get tarif() { return this.#tarif; }
    get caution() { return this.#caution; }
    get nbParticipants() { return this.#nbParticipants; }
    get clientId() { return this.#clientId; }
    get materiels() { return this.#materiels; }

    // Méthode pour obtenir la couleur selon le type d'activité
    getColor() {
        switch(this.#typeActivite) {
            case 'Cours':
                return '#28a745'; // Vert pour les cours
            case 'Location':
                return '#007bff'; // Bleu pour les locations
            default:
                return '#6c757d'; // Gris par défaut
        }
    }
}

// Classes spécifiques pour Cours et Location
class Cours extends Activite {
    #heureDebut;
    #heureFin;
    #niveau;
    #etat;
    #moniteurId;

    constructor(data, apiClient) {
        super(data, apiClient);
        const { heureDebut, heureFin, niveau, etat, moniteur_id } = data.details || {};
        this.#heureDebut = heureDebut;
        this.#heureFin = heureFin;
        this.#niveau = niveau;
        this.#etat = etat;
        this.#moniteurId = moniteur_id;
    }

    get heureDebut() { return this.#heureDebut; }
    get heureFin() { return this.#heureFin; }
    get niveau() { return this.#niveau; }
    get etat() { return this.#etat; }
    get moniteurId() { return this.#moniteurId; }
}

class Location extends Activite {
    #heureDebut;
    #heureFin;
    #materielId;
    #etat;
    #moniteurId;

    constructor(data, apiClient) {
        super(data, apiClient);
        const { heureDebut, heureFin, materiel_id, etat, moniteur_id } = data.details || {};
        this.#heureDebut = heureDebut;
        this.#heureFin = heureFin;
        this.#materielId = materiel_id;
        this.#etat = etat;
        this.#moniteurId = moniteur_id;
    }

    get heureDebut() { return this.#heureDebut; }
    get heureFin() { return this.#heureFin; }
    get materielId() { return this.#materielId; }
    get etat() { return this.#etat; }
    get moniteurId() { return this.#moniteurId; }
}

class ActiviteManager {
    #apiClient;
    #activites;

    constructor(apiBaseURL) {
        this.#apiClient = new APIClient(apiBaseURL);
        this.#activites = new Map();
    }

    async loadAllActivites() {
        try {
            const activitesData = await this.#apiClient.request('/api/activites');
            this.#activites.clear();
            
            activitesData.forEach(data => {
                const activite = data.typeRes === 'Cours' 
                    ? new Cours(data, this.#apiClient)
                    : new Location(data, this.#apiClient);
                this.#activites.set(activite.id, activite);
            });
            
            return this.getAllActivites();
        } catch (error) {
            console.error('Erreur lors du chargement des activités:', error);
            throw error;
        }
    }

    async createActivite(activityData) {
        try {
            const response = await this.#apiClient.request('/api/activites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activityData)
            });
            await this.loadAllActivites(); // Recharger toutes les activités
            return response;
        } catch (error) {
            console.error('Erreur lors de la création de l\'activité:', error);
            throw error;
        }
    }

    async updateActivite(id, activityData) {
        try {
            const response = await this.#apiClient.request(`/api/activites/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activityData)
            });
            await this.loadAllActivites(); // Recharger toutes les activités
            return response;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'activité:', error);
            throw error;
        }
    }

    async deleteActivite(id) {
        try {
            await this.#apiClient.request(`/api/activites/${id}`, {
                method: 'DELETE'
            });
            this.#activites.delete(id);
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'activité:', error);
            throw error;
        }
    }

    getAllActivites() {
        return Array.from(this.#activites.values());
    }

    getActivitesByDate(date) {
        return this.getAllActivites().filter(activite => {
            const activiteDate = new Date(activite.date);
            return activiteDate.toDateString() === date.toDateString();
        });
    }
} 