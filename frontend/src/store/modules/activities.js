import ApiService from '@/services/api.service'

export default {
  namespaced: true,
  
  state: {
    activities: [],
    loading: false,
    error: null
  },

  getters: {
    activitiesByDate: (state) => (date) => {
      const dateStr = date.toISOString().split('T')[0]
      console.log('State activities:', state.activities)
      console.log('Looking for date:', dateStr)
      const filtered = state.activities.filter(activity => {
        console.log('Comparing:', activity.date, 'with', dateStr)
        return activity.date === dateStr
      })
      console.log('Filtered activities:', filtered)
      return filtered
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
    DELETE_ACTIVITY(state, id) {
      state.activities = state.activities.filter(activity => activity.id !== id);
    }
  },

  actions: {
    async fetchActivities({ commit }, { start, end }) {
      commit('SET_LOADING', true)
      try {
        const response = await ApiService.get(`/activities?start=${start}&end=${end}`)
        console.log('API Response:', response)
        
        // Vérifier et transformer les données si nécessaire
        const formattedActivities = response.map(activity => ({
          ...activity,
          date: activity.date.split('T')[0], // S'assurer que la date est au bon format
          details: {
            ...activity.details,
            heureDebut: activity.details.heureDebut || '',
            heureFin: activity.details.heureFin || ''
          }
        }))
        
        console.log('Formatted activities:', formattedActivities)
        commit('SET_ACTIVITIES', formattedActivities)
      } catch (error) {
        console.error('Error fetching activities:', error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createActivity({ commit }, activityData) {
      try {
        const activity = await ApiService.post('/activities', activityData)
        return activity
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updateActivity({ commit }, { id, data }) {
      try {
        const activity = await ApiService.put(`/activities/${id}`, data)
        return activity
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async deleteActivity({ commit }, id) {
      try {
        await ApiService.delete(`/activities/${id}`);
        commit('DELETE_ACTIVITY', id);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'activité:', error);
        throw error;
      }
    }
  }
} 