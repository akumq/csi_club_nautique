<template>
  <div class="main-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Tableau de bord</h1>
      <div class="d-flex gap-3">
        <div class="btn-group">
          <button class="btn btn-outline-primary" @click="previousMonth">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="btn btn-outline-primary">
            {{ currentMonthName }} {{ currentYear }}
          </button>
          <button class="btn btn-outline-primary" @click="nextMonth">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
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
      </div>
    </div>

    <div class="calendar-grid">
      <div class="weekdays-header">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>
      
      <div class="days-grid">
        <div 
          v-for="day in calendarDays" 
          :key="day.date"
          class="day-card"
          :class="{ 
            'other-month': !day.isCurrentMonth,
            'today': day.isToday 
          }"
          @click="showDaySchedule(day)"
        >
          <div class="day-header">
            <span class="day-number">{{ day.number }}</span>
            <button 
              v-if="day.isCurrentMonth"
              class="btn btn-sm btn-primary"
              @click="addActivity(day)"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
          
          <div class="activities-list">
            <div 
              v-for="activity in filterActivities(day.activities)"
              :key="activity.id"
              class="activity-item"
              :class="activity.typeres.toLowerCase()"
              @click="editActivity(activity)"
            >
              <div class="activity-time">
                {{ formatTime(activity.details.heureDebut) }}
              </div>
              <div class="activity-info">
                <strong>{{ activity.typeres }}</strong>
                <template v-if="activity.typeres === 'Cours'">
                  <div>Niveau: {{ activity.details.niveau }}</div>
                </template>
                <template v-else>
                  <div>{{ activity.details.nbParticipants }} pers.</div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal du planning journalier -->
    <DayScheduleModal
      v-if="selectedDay"
      :date="selectedDay.date"
      :activities="selectedDay.activities"
      @close="selectedDay = null"
      @add-activity="handleAddActivity"
      @edit-activity="editActivity"
    />

    <!-- Modal d'activité -->
    <ActivityModal
      v-if="showActivityModal"
      :activity="selectedActivity"
      :date="selectedDate"
      @save="handleActivitySave"
      @close="closeActivityModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import ActivityModal from '@/components/ActivityModal.vue'
import DayScheduleModal from '@/components/DayScheduleModal.vue'
import { useRouter } from 'vue-router'

export default {
  name: 'DashboardView',

  components: {
    ActivityModal,
    DayScheduleModal
  },

  setup() {
    const store = useStore()
    const router = useRouter()
    const currentDate = ref(new Date())
    const selectedTypes = ref(['Cours', 'Location'])
    const showActivityModal = ref(false)
    const selectedActivity = ref(null)
    const selectedDate = ref(null)
    const selectedDay = ref(null)
    const selectedClient = ref(null)
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    const activityTypes = ['Cours', 'Location']

    const currentMonthName = computed(() => months[currentDate.value.getMonth()])
    const currentYear = computed(() => currentDate.value.getFullYear())

    const previousMonth = async () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
      await loadActivities()
    }

    const nextMonth = async () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
      await loadActivities()
    }

    const calendarDays = computed(() => {
      const days = []
      const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
      const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
      
      // Jours du mois précédent
      let firstDay = date.getDay() - 1
      if (firstDay === -1) firstDay = 6
      const prevMonth = new Date(date)
      prevMonth.setDate(0)
  
      for (let i = firstDay - 1; i >= 0; i--) {
        const dayDate = new Date(prevMonth.getTime() - i * 24 * 60 * 60 * 1000)
        const formattedDate = dayDate.toISOString().split('T')[0]
        days.push({
          number: prevMonth.getDate() - i,
          date: dayDate,
          isCurrentMonth: false,
          isToday: false,
          activities: store.getters['activities/getActivitiesByDate'](formattedDate)
        })
      }

      // Jours du mois actuel
      const today = new Date()
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), i)
        const formattedDate = currentDate.toISOString().split('T')[0]
        days.push({
          number: i,
          date: currentDate,
          isCurrentMonth: true,
          isToday: currentDate.toDateString() === today.toDateString(),
          activities: store.getters['activities/getActivitiesByDate'](formattedDate)
        })
      }

      // Jours du mois suivant
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, i)
        const formattedDate = nextDate.toISOString().split('T')[0]
        days.push({
          number: i,
          date: nextDate,
          isCurrentMonth: false,
          isToday: false,
          activities: store.getters['activities/getActivitiesByDate'](formattedDate)
        })
      }

      return days
    })

    const filterActivities = (activities) => {
      return activities.filter(activity => selectedTypes.value.includes(activity.typeres));
    }

    const toggleActivityType = (type) => {
      const index = selectedTypes.value.indexOf(type)
      if (index === -1) {
        selectedTypes.value.push(type)
      } else {
        selectedTypes.value.splice(index, 1)
      }
    }

    const getActivityTypeIcon = (type) => {
      const icons = {
        'Cours': 'fas fa-chalkboard-teacher',
        'Location': 'fas fa-key',
      }
      return icons[type]
    }

    const formatTime = (time) => {
      return time.substring(0, 5)
    }

    const addActivity = async (activityData) => {
      //console.log('Données d\'activité reçues:', activityData);
      if (!activityData || !activityData.date) {
        //console.error('Données d\'activité invalides:', activityData);
        return;
      }

      try {
        // Logique pour ajouter l'activité
        await store.dispatch('activities/addActivity', activityData);
        console.log('Activité ajoutée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'activité:', error);
      }
    }

    const editActivity = (activity) => {
      selectedActivity.value = activity;
      selectedDate.value = new Date(activity.date);
      showActivityModal.value = true;
    }

    const closeActivityModal = () => {
      showActivityModal.value = false
      selectedActivity.value = null
      selectedDate.value = null
    }

    const handleActivitySave = async (activityData) => {
      try {
        if (selectedActivity.value) {
          await store.dispatch('activities/updateActivity', {
            id: selectedActivity.value.id,
            data: activityData
          })
        } else {
          await store.dispatch('activities/createActivity', activityData)
        }
        closeActivityModal()
        await loadActivities()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      }
    }

    const loadActivities = async () => {
      try {
        const start = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
        const end = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
        
        // Charger les activités pour tout le mois
        await store.dispatch('activities/fetchActivities', {
          start: start.toISOString(),
          end: end.toISOString()
        })
        
        console.log('Activités chargées:', store.getters['activities/allActivities'])
      } catch (error) {
        console.error('Erreur lors du chargement des activités:', error)
        if (error.response?.status === 403) {
          router.push('/login')
        }
      }
    }

    const showDaySchedule = (day) => {
      selectedDay.value = day
    }

    const handleAddActivity = () => {
      console.log('Bouton Nouvelle activité cliqué');
      showActivityModal.value = true;
    }

    const activities = computed(() => {
      return store.getters['activities/allActivities'];
    });

    const showActivitiesModal = (client) => {
      console.log('Showing activities for client:', client)
      selectedClient.value = client
      showActivitiesModal.value = true
    }

    onMounted(async () => {
      try {
        selectedDate.value = new Date();
        await loadActivities();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du tableau de bord:', error);
      }
    });

    onMounted(() => {
      store.dispatch('activities/fetchActivities');
    });

    return {
      currentMonthName,
      currentYear,
      weekDays,
      calendarDays,
      activityTypes,
      selectedTypes,
      showActivityModal,
      selectedActivity,
      selectedDate,
      filterActivities,
      toggleActivityType,
      getActivityTypeIcon,
      formatTime,
      addActivity,
      editActivity,
      closeActivityModal,
      handleActivitySave,
      previousMonth,
      nextMonth,
      selectedDay,
      showDaySchedule,
      handleAddActivity,
      activities,
      showActivitiesModal
    }
  }
}
</script>

<style scoped>
.calendar-grid {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8f9fa;
  padding: 10px;
  border-bottom: 1px solid #dee2e6;
}

.weekday {
  text-align: center;
  font-weight: bold;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  padding: 10px;
}

.day-card {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  min-height: 150px;
  padding: 10px;
}

.day-card.other-month {
  background: #f8f9fa;
  opacity: 0.7;
}

.day-card.today {
  border-color: #0d6efd;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.day-number {
  font-weight: bold;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.activity-item {
  display: flex;
  gap: 8px;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.activity-item:hover {
  background: rgba(0,0,0,0.05);
}

.activity-item.cours {
  background: rgba(25, 135, 84, 0.1);
}

.activity-item.location {
  background: rgba(13, 110, 253, 0.1);
}

.activity-item.reservation {
  background: rgba(255, 193, 7, 0.1);
}

.activity-time {
  font-weight: bold;
  min-width: 45px;
}

.activity-info {
  flex: 1;
}
</style> 