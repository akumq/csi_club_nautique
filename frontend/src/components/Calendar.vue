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
        <div class="activities">
          <div 
            v-for="activity in day.activities" 
            :key="activity.id"
            class="activity"
            :class="activity.typeActivite.toLowerCase()"
            @click.stop="showActivityDetails(activity)"
          >
            {{ activity.typeActivite }} - {{ activity.details.heureDebut }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour le planning journalier -->
    <DayScheduleModal 
      v-if="selectedDay"
      :day="selectedDay"
      :activities="selectedDayActivities"
      @close="selectedDay = null"
      @add-activity="showActivityModal"
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
      let firstDay = date.getDay() - 1
      if (firstDay === -1) firstDay = 6
      const prevMonth = new Date(date)
      prevMonth.setDate(0)
      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
          number: prevMonth.getDate() - i,
          date: new Date(prevMonth.getTime() - i * 24 * 60 * 60 * 1000),
          isCurrentMonth: false,
          isToday: false,
          activities: []
        })
      }

      // Jours du mois actuel
      const today = new Date()
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), i)
        days.push({
          number: i,
          date: currentDate,
          isCurrentMonth: true,
          isToday: currentDate.toDateString() === today.toDateString(),
          activities: store.getters['activities/activitiesByDate'](currentDate)
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

    onMounted(async () => {
      await store.dispatch('activities/fetchActivities')
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
      handleActivitySave
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

/* Autres styles du calendrier... */
</style> 