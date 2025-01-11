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

    showCreateForm() {
        // Créer le formulaire HTML pour ajouter un nouveau client
        const form = document.createElement("form");
        form.setAttribute("id", "create-client-form");

        // Créer les champs du formulaire
        const nameField = document.createElement("input");
        nameField.setAttribute("type", "text");
        nameField.setAttribute("name", "name");
        nameField.setAttribute("placeholder", "Nom du client");

        const emailField = document.createElement("input");
        emailField.setAttribute("type", "email");
        emailField.setAttribute("name", "email");
        emailField.setAttribute("placeholder", "Email du client");

        const submitButton = document.createElement("button");
        submitButton.setAttribute("type", "submit");
        submitButton.textContent = "Créer";

        // Créer un bouton d'annulation pour supprimer le formulaire
        const cancelButton = document.createElement("button");
        cancelButton.setAttribute("type", "button");
        cancelButton.textContent = "Annuler";
        cancelButton.addEventListener("click", () => {
            form.remove(); // Supprimer le formulaire du DOM
        });

        // Ajouter les champs et le bouton au formulaire
        form.appendChild(nameField);
        form.appendChild(emailField);
        form.appendChild(submitButton);
        form.appendChild(cancelButton);

        // Ajouter un gestionnaire d'événements pour envoyer le formulaire
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const name = nameField.value;
            const email = emailField.value;

            try {
                // Appel de la méthode pour créer un client avec les valeurs du formulaire
                await this.createClient(name, email);
                form.reset(); // Réinitialiser le formulaire
                form.remove(); // Supprimer le formulaire du DOM après soumission
            } catch (error) {
                alert("Erreur lors de la création du client: " + error.message);
            }
        });

        // Ajouter le formulaire au DOM
        document.body.appendChild(form);
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

    showEditForm(clientId) {
        this.currentClientId = clientId; // Sauvegarde de l'ID du client à modifier
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            document.getElementById('nom').value = client.nom;
            document.getElementById('prenom').value = client.prenom;
            document.getElementById('mail').value = client.mail;
            document.getElementById('telephone').value = client.telephone;
            document.getElementById('niveau').value = client.niveau;
            document.getElementById('quantiteForfait').value = client.quantiteForfait;

            // Modifier le titre du modal et le bouton
            document.querySelector('.modal-title').textContent = 'Modifier Client';

            // Changer le comportement du formulaire pour modifier un client
            const form = document.getElementById('clientForm');
            form.onsubmit = async (e) => {
                e.preventDefault();
                const updatedClientData = {
                    nom: document.getElementById('nom').value,
                    prenom: document.getElementById('prenom').value,
                    mail: document.getElementById('mail').value,
                    telephone: document.getElementById('telephone').value,
                    niveau: document.getElementById('niveau').value,
                    quantiteForfait: Number(document.getElementById('quantiteForfait').value)
                };
                try {
                    await this.updateClient(clientId, updatedClientData);
                    this.loadAllClients(); // Recharger la liste après modification
                    $('#createClientModal').modal('hide'); // Ferme le modal
                } catch (error) {
                    alert('Erreur lors de la modification du client.');
                }
            };

            $('#createClientModal').modal('show'); // Afficher le modal
        }
    }

    // Méthode pour créer un client
    async createClient(clientData) {
        try {
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
            alert("Client supprimé avec succès.");
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
