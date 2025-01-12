// Classe de base Reservation
class Reservation {
    #id;
    #date;
    #duree;
    #typeRes;
    #tarif;
    #caution;
    #nbParticipants;
    #clientId;
    #apiClient;
    #materiels;

    constructor(data, apiClient) {
        if (this.constructor === Reservation) {
            throw new Error("Reservation est une classe abstraite");
        }
        
        const { id, date, duree, typeRes, tarif, caution, nbParticipants, client_id } = data;
        this.#id = id;
        this.#date = date;
        this.#duree = duree;
        this.#typeRes = typeRes;
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
    get typeRes() { return this.#typeRes; }
    get tarif() { return this.#tarif; }
    get caution() { return this.#caution; }
    get nbParticipants() { return this.#nbParticipants; }
    get clientId() { return this.#clientId; }
    get materiels() { return this.#materiels; }
}

// Classe Cours héritant de Reservation
class Cours extends Reservation {
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

    // Getters spécifiques aux cours
    get heureDebut() { return this.#heureDebut; }
    get heureFin() { return this.#heureFin; }
    get niveau() { return this.#niveau; }
    get etat() { return this.#etat; }
    get moniteurId() { return this.#moniteurId; }
}

// Classe Location héritant de Reservation
class Location extends Reservation {
    #heureDebut;
    #heureFin;
    #materielId;
    #etat;

    constructor(data, apiClient) {
        super(data, apiClient);
        const { heureDebut, heureFin, materiel_id, etat } = data.details || {};
        this.#heureDebut = heureDebut;
        this.#heureFin = heureFin;
        this.#materielId = materiel_id;
        this.#etat = etat;
    }

    // Getters spécifiques aux locations
    get heureDebut() { return this.#heureDebut; }
    get heureFin() { return this.#heureFin; }
    get materielId() { return this.#materielId; }
    get etat() { return this.#etat; }
}

// Modifier le ReservationManager pour utiliser les bonnes classes
class ReservationManager {
    #apiClient;
    #reservations;

    constructor(apiBaseURL) {
        this.#apiClient = new APIClient(apiBaseURL);
        this.#reservations = new Map();
    }

    async loadAllReservations() {
        try {
            const reservationsData = await this.#apiClient.request('/api/reservations');
            this.#reservations.clear();
            
            reservationsData.forEach(data => {
                const reservation = data.typeRes === 'Cours' 
                    ? new Cours(data, this.#apiClient)
                    : new Location(data, this.#apiClient);
                this.#reservations.set(reservation.id, reservation);
            });
            
            return this.getAllReservations();
        } catch (error) {
            console.error('Erreur lors du chargement des réservations:', error);
            return [];
        }
    }

    getAllReservations() {
        return Array.from(this.#reservations.values());
    }

    async createReservation(data) {
        try {
            const response = await this.#apiClient.request('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            await this.loadAllReservations(); // Recharger toutes les réservations
            return response;
        } catch (error) {
            console.error('Erreur lors de la création de la réservation:', error);
            throw error;
        }
    }

    async deleteReservation(id) {
        try {
            await this.#apiClient.request(`/api/reservations/${id}`, {
                method: 'DELETE'
            });
            this.#reservations.delete(id);
        } catch (error) {
            console.error('Erreur lors de la suppression de la réservation:', error);
            throw error;
        }
    }

    getReservationsByDate(date) {
        return this.getAllReservations().filter(reservation => 
            new Date(reservation.date).toDateString() === new Date(date).toDateString()
        );
    }

    async addMaterielToReservation(reservationId, materielId) {
        try {
            const response = await this.#apiClient.request(`/api/reservations/${reservationId}/materiels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ materielId })
            });
            await this.loadAllReservations();
            return response;
        } catch (error) {
            console.error('Erreur lors de l\'ajout du matériel:', error);
            throw error;
        }
    }

    async removeMaterielFromReservation(reservationId, materielId) {
        try {
            await this.#apiClient.request(`/api/reservations/${reservationId}/materiels/${materielId}`, {
                method: 'DELETE'
            });
            await this.loadAllReservations();
        } catch (error) {
            console.error('Erreur lors de la suppression du matériel:', error);
            throw error;
        }
    }
}
