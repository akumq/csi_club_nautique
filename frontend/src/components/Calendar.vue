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
    const selectedTypes = ref(['Cours', 'Location'])

    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

    const currentMonthName = computed(() => months[currentDate.value.getMonth()])
    const currentYear = computed(() => currentDate.value.getFullYear())

    const calendarDays = computed(() => {
      const days = []
      const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
      const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
      
      // Jours du mois précédent
      const firstDay = date.getDay() || 7 // 1-7 (lundi-dimanche)
      const prevMonthDays = firstDay - 1
      
      if (prevMonthDays > 0) {
        const prevMonth = new Date(date)
        prevMonth.setDate(0)
        for (let i = prevMonthDays - 1; i >= 0; i--) {
          const dayDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i)
          days.push({
            number: prevMonth.getDate() - i,
            date: dayDate,
            isCurrentMonth: false,
            isToday: dayDate.toDateString() === new Date().toDateString(),
            activities: store.getters['activities/activitiesByDate'](dayDate)
          })
        }
      }

      // Jours du mois actuel
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayDate = new Date(date.getFullYear(), date.getMonth(), i)
        days.push({
          number: i,
          date: dayDate,
          isCurrentMonth: true,
          isToday: dayDate.toDateString() === new Date().toDateString(),
          activities: store.getters['activities/activitiesByDate'](dayDate)
        })
      }

      // Jours du mois suivant
      const remainingDays = 42 - days.length
      if (remainingDays > 0) {
        for (let i = 1; i <= remainingDays; i++) {
          const dayDate = new Date(date.getFullYear(), date.getMonth() + 1, i)
          days.push({
            number: i,
            date: dayDate,
            isCurrentMonth: false,
            isToday: dayDate.toDateString() === new Date().toDateString(),
            activities: store.getters['activities/activitiesByDate'](dayDate)
          })
        }
      }

      return days
    })

    const selectedDayActivities = computed(() => {
      if (selectedDay.value) {
        return store.getters['activities/activitiesForSelectedDay'](selectedDay.value.date);
      }
      return [];
    })

    const loadMonthActivities = async () => {
      try {
        const startDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
        const endDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
        await store.dispatch('activities/fetchActivities', {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        })
      } catch (error) {
        console.error('Erreur lors du chargement des activités:', error)
      }
    }

    const previousMonth = async () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
      await loadMonthActivities()
    }

    const nextMonth = async () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
      await loadMonthActivities()
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

    const filterDayActivities = (activities) => {
      return activities
        .filter(activity => selectedTypes.value.includes(activity.typeres))
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
      await loadMonthActivities()
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
      editActivity,
      loadMonthActivities
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