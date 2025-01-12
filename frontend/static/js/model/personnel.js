class Personnel {
    #id;
    #nom;
    #prenom;
    #mail;
    #adresse;
    #telephone;
    #diplome;
    #permis;
    #apiClient;

    constructor(data, apiClient) {
        const { id, nom, prenom, mail, adresse, telephone, diplome, permis } = data;
        
        this.#id = id;
        this.#nom = nom;
        this.#prenom = prenom;
        this.#mail = mail;
        this.#adresse = adresse;
        this.#telephone = telephone;
        this.#diplome = diplome;
        this.#permis = permis;
        this.#apiClient = apiClient;
    }

    // Getters
    get id() { return this.#id; }
    get nom() { return this.#nom; }
    get prenom() { return this.#prenom; }
    get mail() { return this.#mail; }
    get adresse() { return this.#adresse; }
    get telephone() { return this.#telephone; }
    get diplome() { return this.#diplome; }
    get permis() { return this.#permis; }

    // Méthode pour obtenir les données du personnel sous forme d'objet
    toJSON() {
        return {
            id: this.#id,
            nom: this.#nom,
            prenom: this.#prenom,
            mail: this.#mail,
            adresse: this.#adresse,
            telephone: this.#telephone,
            diplome: this.#diplome,
            permis: this.#permis
        };
    }

    // Méthode pour créer un élément TR pour l'affichage
    toTableRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${this.#id}</td>
            <td>${this.#nom}</td>
            <td>${this.#prenom}</td>
            <td>${this.#mail}</td>
            <td>${this.#adresse}</td>
            <td>${this.#telephone}</td>
            <td>${this.#diplome}</td>
            <td>${this.#permis}</td>
            <td>
                <button class="btn btn-warning btn-sm" data-personnel-id="${this.#id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" data-personnel-id="${this.#id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        return row;
    }

    getType() {
        return this.#apiClient.request(`/api/personnels/${this.#id}`)
            .then(response => {
                if (response.type === 'moniteur') {
                    return 'Moniteur';
                } else if (response.type === 'proprietaire') {
                    return 'Propriétaire';
                }
                return 'Inconnu';
            })
            .catch(error => {
                console.error('Erreur lors de la récupération du type de personnel:', error);
                return 'Inconnu';
            });
    }

    async update(updatedData) {
        try {
            const response = await this.#apiClient.request(`/api/personnels/${this.#id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });
            
            Object.assign(this, new Personnel(response, this.#apiClient));
            return this;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du personnel: ${error.message}`);
        }
    }

    async delete() {
        try {
            await this.#apiClient.request(`/api/personnels/${this.#id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du personnel: ${error.message}`);
        }
    }
}

class PersonnelManager {
    #apiClient;
    #moniteurs;
    #proprietaires;
    #moniteursTableBody;
    #proprietairesTableBody;

    constructor(apiBaseURL, moniteursTableId, proprietairesTableId) {
        this.#apiClient = new APIClient(apiBaseURL);
        this.#moniteurs = new Map();
        this.#proprietaires = new Map();
        this.#moniteursTableBody = document.getElementById(moniteursTableId)?.querySelector('tbody');
        this.#proprietairesTableBody = document.getElementById(proprietairesTableId)?.querySelector('tbody');

        if (!this.#moniteursTableBody || !this.#proprietairesTableBody) {
            throw new Error("L'élément tableau n'a pas été trouvé");
        }

        this.#initEventListeners();
    }

    // Méthodes de gestion du formulaire
    setFormData(data = {}) {
        document.getElementById('nom').value = data.nom || '';
        document.getElementById('prenom').value = data.prenom || '';
        document.getElementById('mail').value = data.mail || '';
        document.getElementById('adresse').value = data.adresse || '';
        document.getElementById('telephone').value = data.telephone || '';
        document.getElementById('diplome').value = data.diplome || '';
        document.getElementById('permis').value = data.permis || '';
    }

    getFormData() {
        return {
            nom: document.getElementById('nom').value,
            prenom: document.getElementById('prenom').value,
            mail: document.getElementById('mail').value,
            adresse: document.getElementById('adresse').value,
            telephone: document.getElementById('telephone').value,
            diplome: document.getElementById('diplome').value,
            permis: document.getElementById('permis').value,
            type: document.getElementById('type').value
        };
    }

    async showCreateForm() {
        const modal = this.insertModalIntoDOM('Créer un Personnel');
        const form = document.getElementById('dynamicPersonnelForm');

        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const personnelData = this.getFormData();
                await this.createPersonnel(personnelData);
                modal.hide();
                await this.loadAllMoniteurs();
            } catch (error) {
                console.error('Erreur lors de la création du personnel:', error);
                alert(error.message);
            }
        };

        modal.show();
    }

    async showEditForm(personnelId) {
        const personnel = this.#moniteurs.get(Number(personnelId));
        if (!personnel) return;

        const modal = this.insertModalIntoDOM('Modifier Personnel');
        this.setFormData(personnel.toJSON());

        const form = document.getElementById('dynamicPersonnelForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const personnelData = this.getFormData();
                await this.updatePersonnel(personnelId, personnelData);
                modal.hide();
                await this.loadAllMoniteurs();
            } catch (error) {
                console.error('Erreur lors de la mise à jour du personnel:', error);
                alert(error.message);
            }
        };

        modal.show();
    }

    #initEventListeners() {
        this.#moniteursTableBody.addEventListener('click', async (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const personnelId = button.dataset.personnelId;
            if (!personnelId) return;

            if (button.classList.contains('btn-warning')) {
                this.showEditForm(personnelId);
            } else if (button.classList.contains('btn-danger')) {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce personnel ?')) {
                    await this.deletePersonnel(personnelId);
                }
            }
        });
    }

    async loadAllMoniteurs() {
        try {
            console.log('Chargement des moniteurs...');
            const moniteursData = await this.#apiClient.request('/api/personnels?type=moniteur');
            
            this.#moniteurs.clear();
            moniteursData.forEach(data => {
                const personnel = new Personnel(data, this.#apiClient);
                this.#moniteurs.set(personnel.id, personnel);
            });

            this.#refreshMoniteursDisplay();
        } catch (error) {
            console.error('Erreur lors du chargement des moniteurs:', error);
            throw error;
        }
    }

    async loadAllProprietaires() {
        try {
            console.log('Chargement des propriétaires...');
            const proprietairesData = await this.#apiClient.request('/api/personnels?type=proprietaire');
            
            this.#proprietaires.clear();
            proprietairesData.forEach(data => {
                const personnel = new Personnel(data, this.#apiClient);
                this.#proprietaires.set(personnel.id, personnel);
            });

            this.#refreshProprietairesDisplay();
        } catch (error) {
            console.error('Erreur lors du chargement des propriétaires:', error);
            throw error;
        }
    }

    async createPersonnel(personnelData) {
        try {
            const response = await this.#apiClient.request('/api/personnels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(personnelData)
            });

            const newPersonnel = new Personnel(response, this.#apiClient);
            this.#moniteurs.set(newPersonnel.id, newPersonnel);
            this.#refreshMoniteursDisplay();
            return newPersonnel;
        } catch (error) {
            throw new Error(`Erreur lors de la création du personnel: ${error.message}`);
        }
    }

    async updatePersonnel(personnelId, updatedData) {
        const personnel = this.#moniteurs.get(Number(personnelId));
        if (!personnel) {
            throw new Error('Personnel non trouvé');
        }

        try {
            await personnel.update(updatedData);
            this.#refreshMoniteursDisplay();
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du personnel: ${error.message}`);
        }
    }

    async deletePersonnel(personnelId) {
        const personnel = this.#moniteurs.get(Number(personnelId));
        if (!personnel) {
            throw new Error('Personnel non trouvé');
        }

        try {
            await personnel.delete();
            this.#moniteurs.delete(Number(personnelId));
            this.#refreshMoniteursDisplay();
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du personnel: ${error.message}`);
        }
    }

    #refreshMoniteursDisplay() {
        this.#moniteursTableBody.innerHTML = '';
        this.#moniteurs.forEach(moniteur => {
            this.#moniteursTableBody.appendChild(moniteur.toTableRow());
        });
    }

    #refreshProprietairesDisplay() {
        this.#proprietairesTableBody.innerHTML = '';
        this.#proprietaires.forEach(proprietaire => {
            this.#proprietairesTableBody.appendChild(proprietaire.toTableRow());
        });
    }

    insertModalIntoDOM(title) {
        const existingModal = document.getElementById('dynamicPersonnelModal');
        if (existingModal) existingModal.remove();

        const template = document.getElementById('personnelModalTemplate').content.cloneNode(true);
        const modalTitle = template.querySelector('.modal-title');
        modalTitle.textContent = title;

        document.body.appendChild(template);
        return new bootstrap.Modal(document.getElementById('dynamicPersonnelModal'));
    }
} 