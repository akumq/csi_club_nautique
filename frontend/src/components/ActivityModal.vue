<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ activity ? 'Modifier' : 'Nouvelle' }} Activité
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Type d'activité -->
            <div class="mb-3">
              <label class="form-label">Type d'activité</label>
              <select class="form-control" v-model="form.typeRes" required>
                <option value="Cours">Cours</option>
                <option value="Location">Location</option>
              </select>
            </div>

            <!-- Date -->
            <div class="mb-3">
              <label class="form-label">Date</label>
              <input type="date" class="form-control" v-model="form.date" required>
            </div>

            <!-- Heures -->
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Heure de début</label>
                <input type="time" class="form-control" v-model="form.details.heureDebut" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Heure de fin</label>
                <input type="time" class="form-control" v-model="form.details.heureFin" required>
                <div class="text-danger" v-if="timeError">{{ timeError }}</div>
              </div>
            </div>

            <!-- Client -->
            <div class="mb-3">
              <label class="form-label">Client</label>
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="clientSearch"
                  @input="showClientsList = true"
                  placeholder="Rechercher un client..."
                >
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="showClientsList = !showClientsList"
                >
                  <i class="fas fa-search"></i>
                </button>
              </div>
              <div v-if="showClientsList && filteredClients.length > 0" class="list-group mt-2">
                <button
                  v-for="client in filteredClients"
                  :key="client.id"
                  type="button"
                  class="list-group-item list-group-item-action"
                  @click="selectClient(client)"
                >
                  {{ client.prenom }} {{ client.nom }}
                </button>
              </div>
              <div v-if="selectedClient" class="mt-2">
                Client sélectionné: {{ selectedClient.prenom }} {{ selectedClient.nom }}
              </div>
            </div>

            <!-- Champs spécifiques aux cours -->
            <div v-if="form.typeRes === 'Cours'" class="mb-3">
              <div class="mb-3">
                <label class="form-label">Niveau</label>
                <EnumSelect
                  enum-name="ENiveau"
                  v-model="form.details.niveau"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Moniteur</label>
                <select class="form-control" v-model="form.details.moniteur_id" required>
                  <option value="">Sélectionnez un moniteur</option>
                  <option v-for="moniteur in moniteurs" :key="moniteur.id" :value="moniteur.id">
                    {{ moniteur.prenom }} {{ moniteur.nom }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Champs spécifiques aux locations -->
            <div v-if="form.typeRes === 'Location'" class="mb-3">
              <label class="form-label">Matériel</label>
              <div class="list-group">
                <div v-for="materiel in availableMaterials" :key="materiel.id" class="list-group-item">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox"
                      :value="materiel.id"
                      v-model="form.details.materiels"
                      :id="'materiel-' + materiel.id"
                    >
                    <label class="form-check-label" :for="'materiel-' + materiel.id">
                      {{ materiel.type }} #{{ materiel.id }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informations communes -->
            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">Durée (heures)</label>
                <input type="number" step="0.5" class="form-control" v-model.number="form.duree" required>
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Tarif (€)</label>
                <input type="number" step="0.01" class="form-control" v-model.number="form.tarif" required>
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Caution (€)</label>
                <input type="number" step="0.01" class="form-control" v-model.number="form.caution" required>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Nombre de participants</label>
              <input type="number" class="form-control" v-model.number="form.nbParticipants" required min="1" :max="form.typeRes === 'Cours' ? 10 : undefined">
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Annuler
              </button>
              <button 
                v-if="activity"
                type="button" 
                class="btn btn-danger me-2"
                @click="handleDelete"
              >
                Supprimer
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ activity ? 'Mettre à jour' : 'Créer' }}
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
import EnumSelect from './EnumSelect.vue'

export default {
  name: 'ActivityModal',
  
  components: {
    EnumSelect
  },

  props: {
    activity: {
      type: Object,
      default: null
    },
    selectedDate: {
      type: Date,
      required: false
    }
  },

  emits: ['save', 'close', 'delete'],

  setup(props, { emit }) {
    const store = useStore()
    const loading = ref(false)
    const timeError = ref('')
    const clientSearch = ref('')
    const showClientsList = ref(false)
    const selectedClient = ref(null)
    const moniteurs = ref([])

    const form = ref({
      date: '',
      typeRes: 'Cours',
      duree: 1,
      tarif: 0,
      caution: 0,
      nbParticipants: 1,
      client_ids: [],
      details: {
        heureDebut: '09:00',
        heureFin: '10:00',
        niveau: 'Débutant',
        moniteur_id: null,
        materiels: []
      }
    })

    // Charger les données initiales
    onMounted(async () => {
      try {
        // Charger les moniteurs
        const moniteursList = await store.dispatch('personnel/fetchMoniteurs')
        moniteurs.value = moniteursList

        // Charger les matériels disponibles
        await store.dispatch('materials/fetchAvailableMaterials')

        // Charger les clients
        await store.dispatch('clients/fetchClients')

        // Si une activité est fournie, initialiser le formulaire
        if (props.activity) {
          form.value = {
            date: props.activity.date,
            typeRes: props.activity.typeRes,
            duree: props.activity.duree,
            tarif: props.activity.tarif,
            caution: props.activity.caution,
            nbParticipants: props.activity.nbParticipants,
            client_id: props.activity.client_id,
            details: props.activity.details
          }
        } else if (props.selectedDate) {
          form.value.date = props.selectedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
        } else {
          form.value.date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    })

    // Calculer les matériels disponibles
    const availableMaterials = computed(() => {
      return store.getters['materials/availableMaterials']()
    })

    // Récupérer tous les clients
    const clients = computed(() => store.getters['clients/allClients'])

    const filteredClients = computed(() => {
      const search = clientSearch.value.toLowerCase()
      return clients.value.filter(client => 
        client.nom.toLowerCase().includes(search) ||
        client.prenom.toLowerCase().includes(search) ||
        client.email?.toLowerCase().includes(search)
      )
    })

    // Sélectionner un client
    const selectClient = (client) => {
      selectedClient.value = client
      form.value.client_id = client.id
      showClientsList.value = false
      clientSearch.value = `${client.prenom} ${client.nom}`
    }

    // Valider les heures
    const validateTimes = () => {
      if (form.value.details.heureDebut && form.value.details.heureFin) {
        const debut = form.value.details.heureDebut.split(':').map(Number)
        const fin = form.value.details.heureFin.split(':').map(Number)
        
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

    // Gérer la soumission
    const handleSubmit = async () => {
      if (!validateTimes()) return

      loading.value = true
      try {
        const activityData = {
          ...form.value,
          client_ids: form.value.client_ids
        }

        if (props.activity) {
          await store.dispatch('activities/updateActivity', {
            id: props.activity.id,
            data: activityData
          })
        } else {
          await store.dispatch('activities/createActivity', activityData)
        }

        emit('save')
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } finally {
        loading.value = false
      }
    }

    // Gérer la suppression
    const handleDelete = async () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
        loading.value = true
        try {
          await store.dispatch('activities/deleteActivity', props.activity.id)
          emit('delete')
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        } finally {
          loading.value = false
        }
      }
    }

    const getClientName = (id) => {
      const client = clients.value.find(c => c.id === id)
      return client ? `${client.prenom} ${client.nom}` : 'Inconnu'
    }

    return {
      form,
      loading,
      timeError,
      clientSearch,
      showClientsList,
      selectedClient,
      filteredClients,
      moniteurs,
      availableMaterials,
      selectClient,
      handleSubmit,
      handleDelete,
      getClientName
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.list-group {
  max-height: 200px;
  overflow-y: auto;
}
</style> 