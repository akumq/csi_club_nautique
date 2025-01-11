class Client {
    #id;
    #nom;
    #prenom;
    #mail;
    #telephone;
    #niveau;
    #quantiteforfait;
    #apiClient;

    constructor(data, apiClient) {
        const { id, nom, prenom, mail, telephone, niveau, quantiteforfait } = data;
        
        this.#id = id;
        this.#nom = nom;
        this.#prenom = prenom;
        this.#mail = mail;
        this.#telephone = telephone;
        this.#niveau = niveau;
        this.#quantiteforfait = quantiteforfait;
        this.#apiClient = apiClient;
    }

    // Getters
    get id() { return this.#id; }
    get nom() { return this.#nom; }
    get prenom() { return this.#prenom; }
    get mail() { return this.#mail; }
    get telephone() { return this.#telephone; }
    get niveau() { return this.#niveau; }
    get quantiteforfait() { return this.#quantiteforfait; }

    // Méthode pour obtenir les données du client sous forme d'objet
    toJSON() {
        return {
            id: this.#id,
            nom: this.#nom,
            prenom: this.#prenom,
            mail: this.#mail,
            telephone: this.#telephone,
            niveau: this.#niveau,
            quantiteforfait: this.#quantiteforfait
        };
    }

    // Méthode pour créer un élément TR pour l'affichage
    toTableRow() {
        const row = document.createElement('tr');
        console.log(this.#quantiteforfait)
        row.innerHTML = `
            <td>${this.#id}</td>
            <td>${this.#nom}</td>
            <td>${this.#prenom}</td>
            <td>${this.#mail}</td>
            <td>${this.#telephone}</td>
            <td>${this.#niveau}</td>
            <td>${this.#quantiteforfait !== undefined ? this.#quantiteforfait : 'N/A'}</td>
            <td>
                <button class="btn btn-warning" data-client-id="${this.#id}">Edit</button>
                <button class="btn btn-danger" data-client-id="${this.#id}">Delete</button>
            </td>
        `;
        return row;
    }
    
    // Méthodes d'instance pour la gestion du client
    async update(updatedData) {
        try {
            const response = await this.#apiClient.request(`/api/clients/${this.#id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });
            
            Object.assign(this, new Client(response, this.#apiClient));
            return this;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du client: ${error.message}`);
        }
    }

    async delete() {
        try {
            await this.#apiClient.request(`/api/clients/${this.#id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du client: ${error.message}`);
        }
    }
}

class ClientManager {
    #apiClient;
    #clients;
    #tableBody;

    constructor(apiBaseUrl, tableElementId) {
        this.#apiClient = new APIClient(apiBaseUrl);
        this.#clients = new Map();
        this.#tableBody = document.getElementById(tableElementId)?.querySelector('tbody');

        if (!this.#tableBody) {
            throw new Error("L'élément tableau n'a pas été trouvé");
        }

        this.#initEventListeners();
    }

    // Méthode pour récupérer ou définir les champs du formulaire
    setFormData(data = {}) {
        document.getElementById('nom').value = data.nom || '';
        document.getElementById('prenom').value = data.prenom || '';
        document.getElementById('mail').value = data.mail || '';
        document.getElementById('telephone').value = data.telephone || '';
        document.getElementById('niveau').value = data.niveau || '';
        document.getElementById('quantiteForfait').value = data.quantiteForfait || '';
    }

    getFormData() {
        return {
            nom: document.getElementById('nom').value,
            prenom: document.getElementById('prenom').value,
            mail: document.getElementById('mail').value,
            telephone: document.getElementById('telephone').value,
            niveau: document.getElementById('niveau').value,
            quantiteForfait: Number(document.getElementById('quantiteForfait').value),
        };
    }

    insertModalIntoDOM(title) {
        // Supprime un modal existant s'il est déjà présent
        const existingModal = document.getElementById('dynamicClientModal');
        if (existingModal) existingModal.remove();

        // Clone le template
        const template = document.getElementById('clientModalTemplate').content.cloneNode(true);

        // Ajoute le titre au modal
        const modalTitle = template.querySelector('.modal-title');
        modalTitle.textContent = title;

        // Ajoute le modal cloné dans le DOM
        document.body.appendChild(template);

        // Retourne l'instance Bootstrap du modal
        return new bootstrap.Modal(document.getElementById('dynamicClientModal'));
    }

    async showCreateForm() {
        const modal = this.insertModalIntoDOM('Nouveau Client');
        this.setFormData(); // Réinitialise les champs du formulaire

        const form = document.getElementById('dynamicClientForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const clientData = this.getFormData();
                await this.createClient(clientData);
                await this.loadAllClients();
                modal.hide();
            } catch (error) {
                console.error('Erreur lors de la création du client :', error.message);
            }
        };

        modal.show();
    }

    async showEditForm(client) {
        const modal = this.insertModalIntoDOM('Modifier Client');
        this.setFormData(client); // Pré-remplit les champs avec les données du client

        const form = document.getElementById('dynamicClientForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const updatedClientData = this.getFormData();
                await this.updateClient(client.id, updatedClientData);
                await this.loadAllClients();
                modal.hide();
            } catch (error) {
                console.error('Erreur lors de la mise à jour du client :', error.message);
            }
        };

        modal.show();
    }

    // Initialisation des écouteurs d'événements
    #initEventListeners() {
        this.#tableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const clientId = button.dataset.clientId;
            if (!clientId) return;

            if (button.classList.contains('btn-warning')) {
                this.showEditForm(clientId);
            } else if (button.classList.contains('btn-danger')) {
                this.deleteClient(clientId);
            }
        });
    }
    // Méthode pour créer un client
    async createClient(clientData) {
        try {
            console.log(clientData)
            const response = await this.#apiClient.request('/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData),
            });
    
            // Vérification des données reçues
            console.log("Client créé :", response);
            
            const newClient = new Client(response, this.#apiClient);
            this.#clients.set(newClient.id, newClient);
            this.#refreshDisplay();
            return newClient;
        } catch (error) {
            throw new Error(`Erreur lors de la création du client: ${error.message}`);
        }
    }
    

    // Méthodes de gestion des clients
    async loadAllClients() {
        try {
            const clientsData = await this.#apiClient.request('/api/clients');
            this.#clients.clear();
            
            clientsData.forEach(data => {
                const client = new Client(data, this.#apiClient);
                this.#clients.set(client.id, client);
            });

            this.#refreshDisplay();
        } catch (error) {
            throw new Error(`Erreur lors du chargement des clients: ${error.message}`);
        }
    }

    async addClient(clientData) {
        return this.createClient(clientData);
    }

    async updateClient(clientId, updatedData) {
        const client = this.#clients.get(Number(clientId));
        if (!client) {
            throw new Error('Client non trouvé');
        }
        try {
            await client.update(updatedData);
            this.#refreshDisplay();
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du client: ${error.message}`);
        }
    }

    async deleteClient(clientId) {
        const client = this.#clients.get(Number(clientId));
        if (!client) {
            throw new Error('Client non trouvé');
        }
    
        try {
            // Suppression du client dans la base de données ou autre
            await client.delete();
            console.log(this.#clients.size)
            // Suppression du client dans la collection interne
            this.#clients.delete(Number(clientId))
    
            // Mise à jour de l'affichage
            this.#refreshDisplay();
            console.log(this.#clients.size)
    
            // Si l'élément client est lié à un élément HTML, vous pouvez également le supprimer directement de la DOM.
            const clientElement = document.getElementById(`client-${clientId}`);
            if (clientElement) {
                clientElement.remove(); // Supprimer l'élément HTML lié à ce client
            }
    
            // Optionnellement, afficher un message de confirmation
            console.log("Client supprimé avec succès.");
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du client: ${error.message}`);
        }
    }

    // Méthode privée pour rafraîchir l'affichage
    #refreshDisplay() {
        this.#tableBody.innerHTML = '';
        this.#clients.forEach(client => {
            this.#tableBody.appendChild(client.toTableRow());
        });
    }
}
