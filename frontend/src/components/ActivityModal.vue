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
import { ref, computed, onMounted } from 'vue'
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
      default: null
    }
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const store = useStore()
    const loading = ref(false)
    const materials = ref([])
    const selectedDate = ref(props.date)
    const timeError = ref('')
    const clients = ref([])
    const clientSearch = ref('')
    
    // Ajout de la variable moniteurs
    const moniteurs = ref([])

    // Ajout du formulaire
    const form = ref({
      typeActivite: props.activity?.typeActivite || 'Cours',
      heureDebut: props.activity?.details?.heureDebut || '',
      heureFin: props.activity?.details?.heureFin || '',
      client_id: props.activity?.details?.client_id || '',
      moniteur_id: props.activity?.details?.moniteur_id || '',
      materiels: props.activity?.details?.materiels?.map(m => m.id) || []
    })

    const availableMaterials = computed(() => {
      return materials.value.filter(material => material.statut === 'Disponible')
    })

    // Ajout de la fonction toggleMateriel
    const toggleMateriel = (materielId) => {
      const index = form.value.materiels.indexOf(materielId);
      if (index === -1) {
        form.value.materiels.push(materielId);
      } else {
        form.value.materiels.splice(index, 1);
      }
    }

    // Ajout de la fonction removeMateriel
    const removeMateriel = (materielId) => {
      const index = form.value.materiels.indexOf(materielId);
      if (index !== -1) {
        form.value.materiels.splice(index, 1);
      }
    }

    // Ajout de la fonction getMaterielInfo
    const getMaterielInfo = (materielId) => {
      const materiel = materials.value.find(m => m.id === materielId);
      return materiel ? `${materiel.type} #${materiel.numero}` : 'Inconnu';
    }

    // Ajout de la fonction validateTimes
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
        return
      }

      loading.value = true
      try {
        const activityData = {
          date: selectedDate.value,
          typeActivite: form.value.typeActivite,
          details: {
            heureDebut: form.value.heureDebut,
            heureFin: form.value.heureFin,
            client_id: form.value.client_id,
          },
          materiels: form.value.materiels
        }

        emit('save', activityData)

        for (const materielId of form.value.materiels) {
          await store.dispatch('materials/updateMaterialStatus', { 
            id: materielId, 
            status: 'En cours d\'utilisation' 
          })
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } finally {
        loading.value = false
      }
    }

    const handleDeleteActivity = async () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
        loading.value = true
        try {
          await store.dispatch('activities/deleteActivity', props.activity.id)
          emit('close')
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'activité:', error)
        } finally {
          loading.value = false
        }
      }
    }

    // Ajout de la fonction pour charger les clients
    const loadClients = async () => {
      try {
        const response = await store.dispatch('clients/fetchClients')
        clients.value = response
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error)
      }
    }

    // Chargement des clients au montage du composant
    onMounted(() => {
      loadClients()
    })

    // Ajout de la fonction pour charger les matériels
    const loadMaterials = async () => {
      try {
        const response = await store.dispatch('materials/fetchAvailableMaterials')
        materials.value = response
      } catch (error) {
        console.error('Erreur lors du chargement des matériels:', error)
      }
    }

    // Chargement des matériels au montage du composant
    onMounted(() => {
      loadMaterials()
    })

    // Ajout de la fonction pour charger les moniteurs
    const loadMoniteurs = async () => {
      try {
        const response = await store.dispatch('personnel/fetchMoniteurs')
        moniteurs.value = response
      } catch (error) {
        console.error('Erreur lors du chargement des moniteurs:', error)
      }
    }

    // Chargement des moniteurs au montage du composant
    onMounted(() => {
      loadMoniteurs()
    })

    // Ajout du computed pour filtrer les clients
    const filteredClients = computed(() => {
      const search = clientSearch.value.toLowerCase()
      return clients.value.filter(client => 
        client.nom.toLowerCase().includes(search) ||
        client.prenom.toLowerCase().includes(search) ||
        client.email.toLowerCase().includes(search)
      )
    })

    return {
      loading,
      form,
      timeError,
      availableMaterials,
      toggleMateriel,
      removeMateriel,
      getMaterielInfo,
      validateTimes,
      handleSubmit,
      handleDeleteActivity,
      moniteurs,
      filteredClients,
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style> 