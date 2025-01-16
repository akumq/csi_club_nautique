<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ formatDate(new Date(date.getTime() - 86400000)) }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="d-flex justify-content-between mb-3">
            <div class="btn-group">
              <button 
                v-for="type in activityTypes" 
                :key="type"
                class="btn btn-outline-secondary"
                :class="{ active: selectedTypes.includes(type) }"
                @click="toggleActivityType(type)"
              >
                <i :class="getActivityTypeIcon(type)"></i>
                {{ type }}
              </button>
            </div>
            <button class="btn btn-primary" @click="$emit('add-activity')">
              <i class="fas fa-plus"></i> Nouvelle activité
            </button>
          </div>
          
          <div class="time-slots">
            <div v-for="hour in hours" :key="hour" class="time-slot">
              <div class="time-label">{{ formatHour(hour) }}</div>
              <div class="activities-container">
                <div 
                  v-for="activity in getActivitiesByHour(hour)"
                  :key="activity.id"
                  class="activity-card"
                  :class="[
                    activity.typeres.toLowerCase(),
                    getActivityStatus(activity)
                  ]"
                  @click="$emit('edit-activity', activity)"
                >
                  <div class="activity-header">
                    <span class="activity-type">{{ getActivityLabel(activity) }}</span>
                    <span class="activity-time">
                      {{ formatTime(activity.details.heureDebut) }} - 
                      {{ formatTime(activity.details.heureFin) }}
                    </span>
                  </div>
                  <div class="activity-details">
                    <template v-if="activity.typeres === 'Cours'">
                      <div>Niveau: {{ activity.details.niveau }}</div>
                      <div>Moniteur: {{ getMoniteurName(activity.details.moniteur_id) }}</div>
                    </template>
                    <template v-else-if="activity.typeres === 'Location'">
                      <div>Client: {{ getClientName(activity.details.client_id) }}</div>
                      <div>Matériel: {{ getMaterielInfo(activity.details.materiel_id) }}</div>
                    </template>
                  </div>
                  <div class="activity-actions">
                    <button @click="confirmDelete(activity)" class="btn btn-link text-danger">
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
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'DayScheduleModal',
  
  props: {
    date: {
      type: Date,
      required: true
    },
    activities: {
      type: Array,
      required: true
    }
  },

  emits: ['close', 'add-activity', 'edit-activity', 'delete-activity'],

  setup(props) {
    //console.log('DayScheduleModal props:', props)

    const store = useStore()
    const selectedTypes = ref(['Cours', 'Location'])
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const activityTypes = ['Cours', 'Location']

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatHour = (hour) => {
      return `${hour.toString().padStart(2, '0')}:00`
    }

    const formatTime = (time) => {
      return time.substring(0, 5)
    }

    const getActivityTypeIcon = (type) => {
      switch (type) {
        case 'Cours': return 'fas fa-graduation-cap'
        case 'Location': return 'fas fa-ship'
        default: return 'fas fa-calendar'
      }
    }

    const getActivitiesByHour = (hour) => {
      return props.activities.filter(activity => {
        if (!selectedTypes.value.includes(activity.typeres)) return false;
        const activityHour = parseInt(activity.details.heureDebut.split(':')[0]);
        return activityHour === hour;
      });
    }

    const getMoniteurName = (id) => {
      const moniteur = store.getters['personnel/getPersonnelById'](id)
      return moniteur ? `${moniteur.prenom} ${moniteur.nom}` : 'Inconnu'
    }

    const getClientName = (id) => {
      const client = store.getters['clients/getClientById'](id)
      return client ? `${client.prenom} ${client.nom}` : 'Inconnu'
    }

    const getMaterielInfo = (id) => {
      const materiel = store.getters['materials/getMaterielById'](id)
      return materiel ? `${materiel.type} #${materiel.numero}` : 'Inconnu'
    }

    const toggleActivityType = (type) => {
      const index = selectedTypes.value.indexOf(type)
      if (index === -1) {
        selectedTypes.value.push(type)
      } else {
        selectedTypes.value.splice(index, 1)
      }
    }

    const confirmDelete = (activity) => {
      if (confirm('Voulez-vous vraiment supprimer cette activité ?')) {
        store.dispatch('activities/deleteActivity', activity.id)
      }
    }

    const getActivityStatus = (activity) => {
      if (!activity.details?.etat) return '';
      return activity.details.etat.toLowerCase();
    };

    const getActivityLabel = (activity) => {
      switch (activity.typeres) {
        case 'Cours':
          return `Cours ${activity.details.niveau}`;
        case 'Location':
          return 'Location';
        default:
          return activity.typeres;
      }
    };

    return {
      hours,
      activityTypes,
      selectedTypes,
      formatDate,
      formatHour,
      formatTime,
      getActivityTypeIcon,
      getActivitiesByHour,
      getMoniteurName,
      getClientName,
      getMaterielInfo,
      toggleActivityType,
      confirmDelete,
      getActivityStatus,
      getActivityLabel
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.schedule-content {
  max-height: 70vh;
  overflow-y: auto;
}

.time-slots {
  max-height: 70vh;
  overflow-y: auto;
}

.time-slot {
  display: flex;
  border-bottom: 1px solid #dee2e6;
  min-height: 60px;
}

.time-label {
  width: 80px;
  padding: 8px;
  font-weight: bold;
  color: #666;
  background: #f8f9fa;
}

.activities-container {
  flex: 1;
  padding: 8px;
}

.activity-card {
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.activity-card:hover {
  filter: brightness(0.95);
}

.activity-card.cours {
  background-color: rgba(25, 135, 84, 0.1);
  border-left: 4px solid #198754;
}

.activity-card.location {
  background-color: rgba(13, 110, 253, 0.1);
  border-left: 4px solid #0d6efd;
}

.activity-card.annule {
  opacity: 0.5;
  text-decoration: line-through;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.activity-time {
  font-weight: bold;
  color: #666;
}

.activity-details {
  font-size: 0.9em;
  color: #666;
}

.activity-details > div {
  margin-bottom: 4px;
}

.activity-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style> 