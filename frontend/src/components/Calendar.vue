<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">
          {{ currentMonthName }} {{ currentYear }}
        </h2>
        <div class="btn-group">
          <button class="btn btn-outline-primary" @click="previousMonth">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="btn btn-outline-primary" @click="nextMonth">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <div class="calendar-weekdays d-flex">
        <div v-for="day in weekDays" :key="day" class="flex-fill text-center">
          {{ day }}
        </div>
      </div>
    </div>

    <div class="calendar-grid">
      <div 
        v-for="day in calendarDays" 
        :key="day.date"
        class="calendar-day"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday
        }"
        @click="showDaySchedule(day)"
      >
        <div class="day-number">{{ day.number }}</div>
        <div class="activities-preview">
          <div 
            v-for="activity in filterDayActivities(day.activities)"
            :key="activity.id"
            class="activity-item"
            :class="[
              activity.typeActivite.toLowerCase(),
              { 'annule': activity.details.etat === 'Annule' }
            ]"
          >
            <div class="activity-time">{{ formatTime(activity.details.heureDebut) }}</div>
            <div class="activity-info">
              <span class="activity-type">{{ getActivityLabel(activity) }}</span>
              <span v-if="activity.typeActivite === 'Cours'" class="activity-details">
                {{ activity.details.niveau }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour le planning journalier -->
    <DayScheduleModal 
      v-if="selectedDay"
      :date="selectedDay.date"
      :activities="selectedDayActivities"
      @close="selectedDay = null"
      @add-activity="showActivityModal"
      @edit-activity="editActivity"
    />

    <!-- Modal pour l'activité -->
    <ActivityModal 
      v-if="showActivityForm"
      :activity="selectedActivity"
      :date="selectedDay?.date"
      @save="handleActivitySave"
      @close="closeActivityModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import DayScheduleModal from './DayScheduleModal.vue'
import ActivityModal from './ActivityModal.vue'

export default {
  name: 'CalendarComponent',

  components: {
    DayScheduleModal,
    ActivityModal
  },

  setup() {
    const store = useStore()
    const currentDate = ref(new Date())
    const selectedDay = ref(null)
    const selectedActivity = ref(null)
    const showActivityForm = ref(false)
    const selectedTypes = ref(['Cours', 'Location', 'Reservation'])

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

    const currentMonthName = computed(() => months[currentDate.value.getMonth()])
    const currentYear = computed(() => currentDate.value.getFullYear())

    const calendarDays = computed(() => {
      const days = []
      const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
      const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
      
      console.log('Building calendar days')
      
      // Jours du mois actuel
      const today = new Date()
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), i)
        const activities = store.getters['activities/activitiesByDate'](currentDate)
        console.log(`Day ${i} activities:`, activities)
        days.push({
          number: i,
          date: currentDate,
          isCurrentMonth: true,
          isToday: currentDate.toDateString() === today.toDateString(),
          activities: activities || [] // S'assurer qu'on a toujours un tableau
        })
      }

      // Jours du mois suivant
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, i)
        days.push({
          number: i,
          date: nextMonth,
          isCurrentMonth: false,
          isToday: false,
          activities: []
        })
      }

      return days
    })

    const selectedDayActivities = computed(() => {
      if (!selectedDay.value) return []
      return store.getters['activities/activitiesByDate'](selectedDay.value.date)
    })

    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
    }

    const showDaySchedule = (day) => {
      selectedDay.value = day
    }

    const showActivityDetails = (activity) => {
      selectedActivity.value = activity
      showActivityForm.value = true
    }

    const showActivityModal = () => {
      selectedActivity.value = null
      showActivityForm.value = true
    }

    const closeActivityModal = () => {
      selectedActivity.value = null
      showActivityForm.value = false
    }

    const handleActivitySave = async (activityData) => {
      try {
        if (selectedActivity.value) {
          await store.dispatch('activities/updateActivity', {
            id: selectedActivity.value.id,
            data: activityData
          })
        } else {
          await store.dispatch('activities/createActivity', {
            ...activityData,
            date: selectedDay.value.date
          })
        }
        closeActivityModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'activité:', error)
      }
    }

    const loadActivities = async () => {
      try {
        const start = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
        const end = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
        
        console.log('Fetching activities from:', start, 'to:', end)
        
        // Formater les dates directement pour l'URL
        const startStr = start.toISOString()
        const endStr = end.toISOString()
        
        console.log('Formatted dates:', startStr, endStr)
        
        await store.dispatch('activities/fetchActivities', {
          start: startStr,
          end: endStr
        })
      } catch (error) {
        console.error('Erreur lors du chargement des activités:', error)
      }
    }

    const filterDayActivities = (activities) => {
      if (!activities) return [];
      return activities
        .filter(activity => selectedTypes.value.includes(activity.typeActivite))
        .sort((a, b) => {
          return a.details.heureDebut?.localeCompare(b.details.heureDebut || '');
        })
        .slice(0, 3);
    };

    const getActivityLabel = (activity) => {
      switch (activity.typeActivite) {
        case 'Cours':
          return `Cours ${activity.details.niveau}`;
        case 'Location':
          return 'Location';
        case 'Reservation':
          return 'Réservation';
        default:
          return activity.typeActivite;
      }
    };

    const formatTime = (time) => {
      if (!time) return '';
      return time.substring(0, 5); // Format HH:mm
    };

    const editActivity = (activity) => {
      console.log('Editing activity:', activity);
      selectedActivity.value = activity;
      showActivityForm.value = true;
    };

    onMounted(async () => {
      await loadActivities()
    })

    return {
      currentMonthName,
      currentYear,
      weekDays,
      calendarDays,
      selectedDay,
      selectedDayActivities,
      showActivityForm,
      selectedActivity,
      previousMonth,
      nextMonth,
      showDaySchedule,
      showActivityDetails,
      showActivityModal,
      closeActivityModal,
      handleActivitySave,
      filterDayActivities,
      getActivityLabel,
      formatTime,
      selectedTypes,
      editActivity,
    }
  }
}
</script>

<style scoped>
.calendar-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}

.calendar-day {
  min-height: 120px;
  padding: 8px;
  border: 1px solid #dee2e6;
  background: white;
}

.activities-preview {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 3px;
  font-size: 0.8em;
}

.activity-item.cours {
  background-color: rgba(25, 135, 84, 0.1);
  border-left: 3px solid #198754;
}

.activity-item.location {
  background-color: rgba(13, 110, 253, 0.1);
  border-left: 3px solid #0d6efd;
}

.activity-item.reservation {
  background-color: rgba(255, 193, 7, 0.1);
  border-left: 3px solid #ffc107;
}

.activity-item.annule {
  opacity: 0.5;
  text-decoration: line-through;
}

.activity-time {
  font-weight: bold;
  margin-right: 4px;
  min-width: 45px;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-type {
  font-weight: 500;
}

.activity-details {
  font-size: 0.9em;
  color: #666;
}

/* Autres styles du calendrier... */
</style> 