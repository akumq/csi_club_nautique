<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Maintenance - {{ material.type }} #{{ material.numero }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">État après maintenance</label>
              <select class="form-control" v-model="form.etat" required>
                <option value="disponible">Disponible</option>
                <option value="en_reparation">En réparation</option>
                <option value="hors_service">Hors service</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Type d'intervention</label>
              <select class="form-control" v-model="form.typeIntervention" required>
                <option value="maintenance">Maintenance préventive</option>
                <option value="reparation">Réparation</option>
                <option value="verification">Vérification</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Coût</label>
              <input 
                type="number" 
                class="form-control" 
                v-model="form.cout"
                min="0"
                step="0.01"
              >
            </div>

            <div class="mb-3">
              <label class="form-label">Notes de maintenance</label>
              <textarea 
                class="form-control" 
                v-model="form.notes"
                rows="4"
                placeholder="Décrivez l'intervention effectuée..."
                required
              ></textarea>
            </div>

            <!-- Historique des maintenances -->
            <div class="mb-3">
              <h6>Historique des maintenances</h6>
              <div class="maintenance-history">
                <div 
                  v-for="(maintenance, index) in maintenanceHistory" 
                  :key="index"
                  class="maintenance-item"
                >
                  <div class="maintenance-date">
                    {{ formatDate(maintenance.date) }}
                  </div>
                  <div class="maintenance-type">
                    {{ maintenance.typeIntervention }}
                  </div>
                  <div class="maintenance-notes">
                    {{ maintenance.notes }}
                  </div>
                </div>
              </div>
            </div>

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
  name: 'MaintenanceModal',
  
  props: {
    material: {
      type: Object,
      required: true
    }
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const store = useStore()
    const loading = ref(false)
    const maintenanceHistory = ref([])
    
    const form = ref({
      etat: props.material.etat,
      typeIntervention: 'maintenance',
      cout: 0,
      notes: ''
    })

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadMaintenanceHistory = async () => {
      try {
        // Supposons qu'il y a une action pour récupérer l'historique
        const history = await store.dispatch('materials/fetchMaintenanceHistory', props.material.id)
        maintenanceHistory.value = history
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error)
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        const maintenanceData = {
          ...form.value,
          date: new Date()
        }
        emit('save', maintenanceData)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(loadMaintenanceHistory)

    return {
      form,
      loading,
      maintenanceHistory,
      formatDate,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.maintenance-history {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
}

.maintenance-item {
  padding: 10px;
  border-bottom: 1px solid #dee2e6;
}

.maintenance-item:last-child {
  border-bottom: none;
}

.maintenance-date {
  font-weight: bold;
  color: #666;
}

.maintenance-type {
  color: #007bff;
  margin: 5px 0;
}

.maintenance-notes {
  font-size: 0.9em;
  color: #666;
}
</style> 