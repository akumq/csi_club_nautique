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
                required
              >
            </div>

            <div class="mb-3">
              <label class="form-label">Heure de fin</label>
              <input 
                type="time" 
                class="form-control" 
                v-model="form.heureFin"
                required
              >
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
            <template v-else>
              <div class="mb-3">
                <label class="form-label">Client</label>
                <select 
                  class="form-control" 
                  v-model="form.client_id"
                  required
                >
                  <option 
                    v-for="client in clients" 
                    :key="client.id" 
                    :value="client.id"
                  >
                    {{ client.prenom }} {{ client.nom }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Matériel</label>
                <select 
                  class="form-control" 
                  v-model="form.materiels"
                  multiple
                  required
                >
                  <option 
                    v-for="materiel in materiels" 
                    :key="materiel.id" 
                    :value="materiel.id"
                  >
                    {{ materiel.type }} - {{ materiel.numero }}
                  </option>
                </select>
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

  setup(props, { emit }) {
    const store = useStore()
    const loading = ref(false)
    const moniteurs = ref([])
    const clients = ref([])
    const materiels = ref([])

    const form = ref({
      typeActivite: props.activity?.typeActivite || 'Cours',
      heureDebut: props.activity?.details.heureDebut || '',
      heureFin: props.activity?.details.heureFin || '',
      niveau: props.activity?.details.niveau || 'Débutant',
      moniteur_id: props.activity?.details.moniteur_id || '',
      client_id: props.activity?.clientId || '',
      materiels: props.activity?.materiels?.map(m => m.id) || []
    })

    const loadData = async () => {
      try {
        const [loadedMoniteurs, loadedClients, loadedMateriels] = await Promise.all([
          store.dispatch('personnel/fetchMoniteurs'),
          store.dispatch('clients/fetchClients'),
          store.dispatch('materials/fetchMateriels')
        ])
        moniteurs.value = loadedMoniteurs
        clients.value = loadedClients
        materiels.value = loadedMateriels
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        const activityData = {
          date: props.date,
          typeActivite: form.value.typeActivite,
          details: {
            heureDebut: form.value.heureDebut,
            heureFin: form.value.heureFin,
            niveau: form.value.niveau,
            moniteur_id: form.value.moniteur_id
          },
          client_id: form.value.client_id,
          materiels: form.value.materiels
        }
        emit('save', activityData)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(loadData)

    return {
      form,
      loading,
      moniteurs,
      clients,
      materiels,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style> 