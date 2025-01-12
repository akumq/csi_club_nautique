class Materiel {
    #id;
    #statut;
    #type;
    #details;
    #apiClient;
    #materielManager;

    constructor(data, apiClient, materielManager) {
        const { id, statut, type, capacite, taille, bateau_type } = data;
        
        this.#id = id;
        this.#statut = statut;
        this.#type = type;
        this.#details = {
            capacite,
            taille,
            bateau_type
        };
        this.#apiClient = apiClient;
        this.#materielManager = materielManager;
    }

    // Getters
    get id() { return this.#id; }
    get statut() { return this.#statut; }
    get type() { return this.#type; }
    get details() { return this.#details; }

    // Méthode pour obtenir les données du matériel sous forme d'objet
    toJSON() {
        return {
            id: this.#id,
            statut: this.#statut,
            type: this.#type,
            ...this.#details
        };
    }

    // Méthode pour créer un élément TR pour l'affichage
    toTableRow() {
        const row = document.createElement('tr');
        row.id = `materiel-${this.#id}`;
        
        let detailsText = '';
        switch(this.#type) {
            case 'Voile':
                detailsText = `Taille: ${this.#details.taille}`;
                break;
            case 'Flotteur':
                detailsText = `Capacité: ${this.#details.capacite}`;
                break;
            case 'Bateau':
                detailsText = `Type: ${this.#details.bateau_type}`;
                break;
            case 'PiedMat':
                detailsText = '-';
                break;
        }

        row.innerHTML = `
            <td>${this.#id}</td>
            <td>${this.#type}</td>
            <td>${this.#statut}</td>
            <td>${detailsText}</td>
            <td>${this.#materielManager.createActionButtons(this.#id)}</td>
        `;
        return row;
    }

    async update(updatedData) {
        try {
            const response = await this.#apiClient.request(`/api/materiels/${this.#id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });
            
            Object.assign(this, new Materiel(response, this.#apiClient, this.#materielManager));
            return this;
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du matériel: ${error.message}`);
        }
    }

    async delete() {
        try {
            await this.#apiClient.request(`/api/materiels/${this.#id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du matériel: ${error.message}`);
        }
    }
}

class MaterielManager {
    #apiClient;
    #materiels;
    #tableBody;
    #enumOptions;

    constructor(apiBaseUrl, tableElementId) {
        this.#apiClient = new APIClient(apiBaseUrl);
        this.#materiels = new Map();
        this.#tableBody = document.getElementById(tableElementId)?.querySelector('tbody');
        this.#enumOptions = {};

        if (!this.#tableBody) {
            throw new Error("L'élément tableau n'a pas été trouvé");
        }

        this.#initEventListeners();
    }

    // Getters et Setters pour les énumérations
    set enumOptions(options) {
        this.#enumOptions = options;
    }

    get enumOptions() {
        return this.#enumOptions;
    }

    // Méthodes de gestion du formulaire
    setFormData(data = {}) {
        document.getElementById('type').value = data.type || '';
        document.getElementById('statut').value = data.statut || '';
        
        // Afficher/masquer les champs spécifiques selon le type
        this.updateSpecificFields(data.type || document.getElementById('type').value);
        
        // Remplir les champs spécifiques si des données existent
        if (data.taille) document.getElementById('taille').value = data.taille;
        if (data.capacite) document.getElementById('capacite').value = data.capacite;
        if (data.bateau_type) document.getElementById('bateau_type').value = data.bateau_type;
    }

    getFormData() {
        const type = document.getElementById('type').value;
        const data = {
            type: type,
            statut: document.getElementById('statut').value
        };

        // Ajouter les champs spécifiques selon le type
        switch(type) {
            case 'Voile':
                data.taille = parseInt(document.getElementById('taille').value);
                break;
            case 'Flotteur':
                data.capacite = parseInt(document.getElementById('capacite').value);
                break;
            case 'Bateau':
                data.bateau_type = document.getElementById('bateau_type').value;
                break;
        }

        return data;
    }

    updateSpecificFields(type) {
        const specificFieldsContainer = document.getElementById('specificFields');
        if (!specificFieldsContainer) return;

        let html = '';
        switch(type) {
            case 'Voile':
                html = `
                    <div class="mb-3">
                        <label for="taille" class="form-label">Taille</label>
                        <input type="number" class="form-control" id="taille" required>
                    </div>
                `;
                break;
            case 'Flotteur':
                html = `
                    <div class="mb-3">
                        <label for="capacite" class="form-label">Capacité</label>
                        <input type="number" class="form-control" id="capacite" required>
                    </div>
                `;
                break;
            case 'Bateau':
                html = `
                    <div class="mb-3">
                        <label for="bateau_type" class="form-label">Type de bateau</label>
                        <select class="form-control" id="bateau_type" required>
                            ${this.#enumOptions.EType_Bateau || ''}
                        </select>
                    </div>
                `;
                break;
        }
        specificFieldsContainer.innerHTML = html;
    }

    async showCreateForm() {
        const modal = this.insertModalIntoDOM('Nouveau Matériel');
        this.setFormData();

        // Ajouter l'écouteur pour le changement de type
        document.getElementById('type').addEventListener('change', (e) => {
            this.updateSpecificFields(e.target.value);
        });

        const form = document.getElementById('dynamicMaterielForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const materielData = this.getFormData();
                await this.createMateriel(materielData);
                modal.hide();
                await this.loadAllMateriels();
            } catch (error) {
                console.error('Erreur lors de la création du matériel:', error);
                alert(error.message);
            }
        };

        modal.show();
    }

    async showEditForm(materielId) {
        const materiel = this.#materiels.get(Number(materielId));
        if (!materiel) return;

        const modal = this.insertModalIntoDOM('Modifier Matériel');
        this.setFormData(materiel.toJSON());

        document.getElementById('type').addEventListener('change', (e) => {
            this.updateSpecificFields(e.target.value);
        });

        const form = document.getElementById('dynamicMaterielForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const materielData = this.getFormData();
                await this.updateMateriel(materielId, materielData);
                modal.hide();
                await this.loadAllMateriels();
            } catch (error) {
                console.error('Erreur lors de la mise à jour du matériel:', error);
                alert(error.message);
            }
        };

        modal.show();
    }

    #initEventListeners() {
        this.#tableBody.addEventListener('click', async (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const materielId = button.dataset.materielId;
            if (!materielId) return;

            if (button.classList.contains('btn-warning')) {
                this.showEditForm(materielId);
            } else if (button.classList.contains('btn-danger')) {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce matériel ?')) {
                    await this.deleteMateriel(materielId);
                }
            }
        });
    }

    async loadAllMateriels() {
        try {
            const materielsData = await this.#apiClient.request('/api/materiels');
            this.#materiels.clear();
            
            materielsData.forEach(data => {
                const materiel = new Materiel(data, this.#apiClient, this);
                this.#materiels.set(materiel.id, materiel);
            });

            this.#refreshDisplay();
        } catch (error) {
            console.error('Erreur lors du chargement des matériels:', error);
            throw error;
        }
    }

    async createMateriel(materielData) {
        try {
            const response = await this.#apiClient.request('/api/materiels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(materielData)
            });

            const newMateriel = new Materiel(response, this.#apiClient, this);
            this.#materiels.set(newMateriel.id, newMateriel);
            this.#refreshDisplay();
            return newMateriel;
        } catch (error) {
            throw new Error(`Erreur lors de la création du matériel: ${error.message}`);
        }
    }

    async updateMateriel(materielId, updatedData) {
        const materiel = this.#materiels.get(Number(materielId));
        if (!materiel) {
            throw new Error('Matériel non trouvé');
        }

        try {
            await materiel.update(updatedData);
            this.#refreshDisplay();
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du matériel: ${error.message}`);
        }
    }

    async deleteMateriel(materielId) {
        const materiel = this.#materiels.get(Number(materielId));
        if (!materiel) {
            throw new Error('Matériel non trouvé');
        }

        try {
            await materiel.delete();
            this.#materiels.delete(Number(materielId));
            this.#refreshDisplay();
        } catch (error) {
            throw new Error(`Erreur lors de la suppression du matériel: ${error.message}`);
        }
    }

    #refreshDisplay() {
        this.#tableBody.innerHTML = '';
        this.#materiels.forEach(materiel => {
            this.#tableBody.appendChild(materiel.toTableRow());
        });
    }

    createActionButtons(id) {
        return `
            <div class="table-actions">
                <button class="btn btn-warning btn-sm btn-action" onclick="materielManager.editMateriel(${id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-action" onclick="materielManager.deleteMateriel(${id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
} 