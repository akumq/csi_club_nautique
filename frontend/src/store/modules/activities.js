import ApiService from '@/services/api.service'

export default {
  namespaced: true,
  
  state: {
    activities: [],
    loading: false,
    error: null
  },

  getters: {
    allActivities: state => state.activities,
    isLoading: state => state.loading,
    error: state => state.error,
    
    // Récupère les activités pour une date spécifique (format ISO)
    getActivitiesByDate: state => date => {
      if (!date) return []
      const targetDate = new Date(date).toISOString().split('T')[0]
      return state.activities.filter(activity => {
        if (activity){
          const activityDate = new Date(activity.date).toISOString().split('T')[0]
          return activityDate === targetDate
        }
      })
    },

    // Récupère les activités pour un mois spécifique
    getActivitiesByMonth: state => (year, month) => {
      return state.activities.filter(activity => {
        const activityDate = new Date(activity.date)
        return activityDate.getFullYear() === year && 
               activityDate.getMonth() === month
      })
    },

    // Récupère les activités pour une plage de dates
    getActivitiesInRange: state => (startDate, endDate) => {
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()
      
      return state.activities.filter(activity => {
        const activityTime = new Date(activity.date).getTime()
        return activityTime >= start && activityTime <= end
      })
    },

    // Récupère les activités par client
    getActivitiesByClient: state => clientId => {
      return state.activities.filter(activity => activity.client_id === clientId)
    },

    // Vérifie les conflits d'horaires
    hasTimeConflict: state => (newActivity, excludeId = null) => {
      return state.activities.some(activity => {
        if (activity.id === excludeId) return false

        const newStart = new Date(`${newActivity.date}T${newActivity.details.heureDebut}`)
        const newEnd = new Date(`${newActivity.date}T${newActivity.details.heureFin}`)
        const activityStart = new Date(`${activity.date}T${activity.details.heureDebut}`)
        const activityEnd = new Date(`${activity.date}T${activity.details.heureFin}`)

        return (newStart < activityEnd && newEnd > activityStart)
      })
    },

    // Getter pour le calendrier
    activitiesByDate: state => date => {
      if (!date) return []
      return state.activities.filter(activity => {
        const activityDate = new Date(activity.date)
        return activityDate.toDateString() === date.toDateString()
      })
    },

    // Getter pour les activités du jour sélectionné
    activitiesForSelectedDay: state => date => {
      if (!date) return []
      return state.activities.filter(activity => {
        const activityDate = new Date(activity.date)
        return activityDate.toDateString() === date.toDateString()
      }).sort((a, b) => {
        // Trier par heure de début
        return a.details.heureDebut.localeCompare(b.details.heureDebut)
      })
    },

    // Getter pour obtenir une activité par son ID
    getActivityById: state => id => {
      return state.activities.find(activity => activity.id === id)
    },

    getActivitiesByType: state => type => {
      return state.activities.filter(activity => activity.typeres === type);
    }
  },

  mutations: {
    SET_ACTIVITIES(state, activities) {
      state.activities = activities
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    ADD_ACTIVITY(state, activity) {
      state.activities.push(activity)
    },
    UPDATE_ACTIVITY(state, updatedActivity) {
      const index = state.activities.findIndex(a => a.id === updatedActivity.id)
      if (index !== -1) {
        state.activities.splice(index, 1, updatedActivity)
      }
    },
    DELETE_ACTIVITY(state, id) {
      state.activities = state.activities.filter(a => a.id !== id)
    }
  },

  actions: {
    async fetchActivities({ commit }, { start, end } = {}) {
      commit('SET_LOADING', true)
      try {
        let url = '/activities'
        if (start && end) {
          url += `?start=${start}&end=${end}`
        }
        const activities = await ApiService.get(url)
        console.log('Activités reçues:', activities)
        commit('SET_ACTIVITIES', activities)
        return activities
      } catch (error) {
        console.error('Erreur lors du chargement des activités:', error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createActivity({ commit, getters }, activityData) {
      // Vérifier les conflits d'horaires
      if (getters.hasTimeConflict(activityData)) {
        throw new Error('Conflit d\'horaires avec une activité existante')
      }

      try {
        const activity = await ApiService.post('/activities', activityData)
        commit('ADD_ACTIVITY', activity)
        return activity
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updateActivity({ commit }, { id, data }) {
      // Vérifier les conflits d'horaires en excluant l'activité en cours de modification
      try {
        const activity = await ApiService.put(`/activities/${id}`, data)
        commit('UPDATE_ACTIVITY', activity)
        return activity
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async deleteActivity({ commit }, id) {
      try {
        await ApiService.delete(`/activities/${id}`)
        commit('DELETE_ACTIVITY', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async fetchActivitiesByDate({ commit }, date) {
      commit('SET_LOADING', true)
      try {
        const activities = await ApiService.get(`/activities?date=${date}`)
        return activities
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async checkAvailability({ commit }, { date, timeSlot, resourceIds }) {
      try {
        const response = await ApiService.post('/activities/check-availability', {
          date,
          timeSlot,
          resourceIds
        })
        return response.available
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
}
