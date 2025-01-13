<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ activity ? 'Modifier' : 'Nouvelle' }} Activité
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Type d'activité</label>
              <select 
                class="form-control" 
                v-model="form.typeActivite"
                required
              >
                <option value="Cours">Cours</option>
                <option value="Location">Location</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Heure de début</label>
              <input 
                type="time" 
                class="form-control" 
                v-model="form.heureDebut"
                :class="{ 'is-invalid': timeError }"
                required
                @input="validateTimes"
              >
            </div>

            <div class="mb-3">
              <label class="form-label">Heure de fin</label>
              <input 
                type="time" 
                class="form-control" 
                v-model="form.heureFin"
                :class="{ 'is-invalid': timeError }"
                required
                @input="validateTimes"
              >
              <div class="invalid-feedback" v-if="timeError">
                {{ timeError }}
              </div>
            </div>

            <!-- Champs spécifiques pour les cours -->
            <template v-if="form.typeActivite === 'Cours'">
              <div class="mb-3">
                <label class="form-label">Niveau</label>
                <select class="form-control" v-model="form.niveau" required>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Moniteur</label>
                <select 
                  class="form-control" 
                  v-model="form.moniteur_id"
                  required
                >
                  <option 
                    v-for="moniteur in moniteurs" 
                    :key="moniteur.id" 
                    :value="moniteur.id"
                  >
                    {{ moniteur.prenom }} {{ moniteur.nom }}
                  </option>
                </select>
              </div>
            </template>

            <!-- Champs spécifiques pour les locations -->
            <template v-if="form.typeActivite === 'Location'">
              <div class="mb-3">
                <label class="form-label">Client</label>
                <div class="input-group">
                  <select 
                    class="form-control" 
                    v-model="form.client_id"
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    <option 
                      v-for="client in filteredClients" 
                      :key="client.id" 
                      :value="client.id"
                    >
                      {{ client.nom }} {{ client.prenom }} - {{ client.email }}
                    </option>
                  </select>
                  <input
                    type="text"
                    class="form-control"
                    v-model="clientSearch"
                    placeholder="Rechercher un client..."
                    @input="filterClients"
                  >
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Tarif</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="form.tarif"
                  required
                  min="0"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Caution</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="form.caution"
                  required
                  min="0"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Matériels</label>
                <div v-if="loading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Chargement...</span>
                  </div>
                </div>
                <div v-else-if="availableMaterials.length === 0" class="alert alert-info">
                  Aucun matériel disponible pour le moment
                </div>
                <div v-else>
                  <div class="selected-materials mb-2" v-if="form.materiels.length > 0">
                    <div 
                      v-for="materielId in form.materiels" 
                      :key="materielId"
                      class="selected-material-item"
                    >
                      {{ getMaterielInfo(materielId) }}
                      <button 
                        type="button" 
                        class="btn-close ms-2" 
                        @click="removeMateriel(materielId)"
                      ></button>
                    </div>
                  </div>
                  <div class="materials-grid">
                    <div 
                      v-for="materiel in availableMaterials" 
                      :key="materiel.id"
                      class="material-card"
                      :class="{ 'selected': form.materiels.includes(materiel.id) }"
                      @click="toggleMateriel(materiel.id)"
                    >
                      <div class="material-info">
                        <strong>{{ materiel.id }} # {{ materiel.type }}</strong>
                        <span v-if="materiel.type === 'Voile' && materiel.taille">
                          Taille: {{ materiel.taille }} m²
                        </span>
                        <span v-if="materiel.type === 'Flotteur' && materiel.capacite">
                          Capacité: {{ materiel.capacite }} L
                        </span>
                        <span v-if="materiel.type === 'Bateau' && materiel.bateau_type">
                          Type: {{ materiel.bateau_type }}
                        </span>
                      </div>
                      <div class="material-status" :class="materiel.statut.toLowerCase()">
                        {{ materiel.statut }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="$emit('close')"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="loading"
              >
                <span 
                  v-if="loading" 
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ActivityModal',
  
  props: {
    activity: {
      type: Object,
      default: null
    },
    date: {
      type: Date,
      required: true
    }
  },

  emits: ['save', 'close'],

  setup(props) {
    const store = useStore()
    const loading = ref(false)
    const moniteurs = ref([])
    const clients = ref([])
    const filteredClients = ref([])
    const clientSearch = ref('')
    const availableMaterials = ref([])
    const timeError = ref('')

    const form = ref({
      typeActivite: props.activity?.typeActivite || 'Cours',
      heureDebut: props.activity?.details.heureDebut || '',
      heureFin: props.activity?.details.heureFin || '',
      niveau: props.activity?.details.niveau || 'Débutant',
      moniteur_id: props.activity?.details.moniteur_id || '',
      client_id: props.activity?.details.client_id || '',
      materiels: props.activity?.details.materiels?.map(m => m.id) || [],
      tarif: props.activity?.details.tarif || 0,
      caution: props.activity?.details.caution || 0
    })

    const filterClients = () => {
      if (!clients.value) return;
      const search = clientSearch.value.toLowerCase().trim()
      if (!search) {
        filteredClients.value = clients.value
        return
      }
      filteredClients.value = clients.value.filter(client => 
        client.nom?.toLowerCase().includes(search) ||
        client.prenom?.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search)
      )
    }

    const getMaterielInfo = (id) => {
      const materiel = store.getters['materials/getMaterielById'](id)
      return materiel ? `${materiel.type} #${materiel.id}` : 'Inconnu'
    }

    const toggleMateriel = (materielId) => {
      const index = form.value.materiels.indexOf(materielId)
      if (index === -1) {
        form.value.materiels.push(materielId)
      } else {
        form.value.materiels.splice(index, 1)
      }
    }

    const removeMateriel = (materielId) => {
      const index = form.value.materiels.indexOf(materielId)
      if (index !== -1) {
        form.value.materiels.splice(index, 1)
      }
    }

    const validateTimes = () => {
      if (form.value.heureDebut && form.value.heureFin) {
        const debut = form.value.heureDebut.split(':').map(Number)
        const fin = form.value.heureFin.split(':').map(Number)
        
        const debutMinutes = debut[0] * 60 + debut[1]
        const finMinutes = fin[0] * 60 + fin[1]
        
        if (debutMinutes >= finMinutes) {
          timeError.value = "L'heure de début doit être antérieure à l'heure de fin"
          return false
        }
      }
      timeError.value = ''
      return true
    }

    const handleSubmit = async () => {
      if (!validateTimes()) {
        return; // Empêcher la soumission si les heures ne sont pas valides
      }

      loading.value = true;
      try {
        const activityData = {
          date: props.date,
          typeActivite: form.value.typeActivite,
          details: {
            heureDebut: form.value.heureDebut,
            heureFin: form.value.heureFin,
            client_id: form.value.client_id,
            tarif: form.value.tarif,
            caution: form.value.caution,
          },
          materiels: form.value.materiels
        };

        await store.dispatch('activities/createActivity', activityData); // Appel à l'action Vuex

        // Mettre à jour le statut des matériels
        for (const materielId of form.value.materiels) {
          await store.dispatch('materials/updateMaterialStatus', { id: materielId, status: 'En cours d\'utilisation' });
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      try {
        loading.value = true
        // Charger les clients d'abord
        const loadedClients = await store.dispatch('clients/fetchClients')
        console.log('Clients chargés:', loadedClients)
        clients.value = loadedClients
        filteredClients.value = loadedClients // Initialiser avec tous les clients

        // Charger le reste des données
        const [moniteurResult, materialsResult] = await Promise.all([
          store.dispatch('personnel/fetchMoniteurs'),
          store.dispatch('materials/fetchAvailableMaterials')
        ])

        moniteurs.value = moniteurResult || []
        availableMaterials.value = materialsResult || []
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        clients.value = []
        filteredClients.value = []
        moniteurs.value = []
        availableMaterials.value = []
      } finally {
        loading.value = false
      }
    })

    return {
      form,
      loading,
      moniteurs,
      clients,
      filteredClients,
      clientSearch,
      availableMaterials,
      filterClients,
      getMaterielInfo,
      toggleMateriel,
      removeMateriel,
      timeError,
      validateTimes,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.material-card {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-card:hover {
  background-color: #f8f9fa;
}

.material-card.selected {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.1);
}

.material-info {
  display: flex;
  flex-direction: column;
}

.material-status {
  font-size: 0.8em;
  padding: 2px 6px;
  border-radius: 3px;
}

.material-status.disponible {
  background-color: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.selected-materials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-material-item {
  background-color: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group select {
  flex: 2;
}

.input-group input {
  flex: 1;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}
</style> 