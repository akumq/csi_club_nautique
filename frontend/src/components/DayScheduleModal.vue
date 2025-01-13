<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ formattedDate }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-primary" @click="$emit('add-activity')">
              <i class="fas fa-plus"></i> Nouvelle activité
            </button>
          </div>
          
          <div class="schedule-content">
            <div v-for="hour in hours" :key="hour" class="time-slot">
              <div class="time-label">{{ formatHour(hour) }}</div>
              <div class="time-activities">
                <div 
                  v-for="activity in getActivitiesByHour(hour)" 
                  :key="activity.id"
                  class="activity"
                  :class="activity.typeActivite.toLowerCase()"
                >
                  <div class="activity-header">
                    <strong>{{ activity.typeActivite }}</strong>
                    <span>{{ activity.details.heureDebut }} - {{ activity.details.heureFin }}</span>
                  </div>
                  <div class="activity-details">
                    <template v-if="activity.typeActivite === 'Cours'">
                      <div>Niveau: {{ activity.details.niveau }}</div>
                      <div>Moniteur: {{ getMoniteurName(activity.details.moniteur_id) }}</div>
                    </template>
                    <template v-else>
                      <div>Client: {{ getClientName(activity.clientId) }}</div>
                      <div>Matériel: {{ getMaterielsList(activity.materiels) }}</div>
                    </template>
                  </div>
                  <div class="activity-actions">
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      @click="$emit('edit-activity', activity)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(activity)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'DayScheduleModal',
  
  props: {
    day: {
      type: Object,
      required: true
    },
    activities: {
      type: Array,
      required: true
    }
  },

  emits: ['close', 'add-activity', 'edit-activity'],

  setup(props) {
    const store = useStore()
    const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8h à 19h

    const formattedDate = computed(() => {
      return new Date(props.day.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    })

    const formatHour = (hour) => `${hour}:00`

    const getActivitiesByHour = (hour) => {
      return props.activities.filter(activity => {
        const activityHour = parseInt(activity.details.heureDebut.split(':')[0])
        return activityHour === hour
      })
    }

    const getMoniteurName = (moniteurId) => {
      const moniteur = store.getters['personnel/getPersonnelById'](moniteurId)
      return moniteur ? `${moniteur.prenom} ${moniteur.nom}` : 'Inconnu'
    }

    const getClientName = (clientId) => {
      const client = store.getters['clients/getClientById'](clientId)
      return client ? `${client.prenom} ${client.nom}` : 'Inconnu'
    }

    const getMaterielsList = (materiels) => {
      return materiels.map(m => m.type).join(', ')
    }

    const confirmDelete = (activity) => {
      if (confirm('Voulez-vous vraiment supprimer cette activité ?')) {
        store.dispatch('activities/deleteActivity', activity.id)
      }
    }

    return {
      hours,
      formattedDate,
      formatHour,
      getActivitiesByHour,
      getMoniteurName,
      getClientName,
      getMaterielsList,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.time-slot {
  display: flex;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.time-label {
  width: 80px;
  font-weight: bold;
}

.time-activities {
  flex: 1;
  margin-left: 10px;
}

/* Autres styles... */
</style> 