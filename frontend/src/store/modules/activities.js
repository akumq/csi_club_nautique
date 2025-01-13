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
      return state.activities.filter(activity => activity.date === dateStr)
    },
    isLoading: state => state.loading,
    error: state => state.error
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
      state.activities = state.activities.filter(activity => activity.id !== id)
    },
    ADD_ACTIVITY(state, activity) {
      state.activities.push(activity)
    },
    UPDATE_ACTIVITY(state, updatedActivity) {
      const index = state.activities.findIndex(a => a.id === updatedActivity.id)
      if (index !== -1) {
        state.activities.splice(index, 1, updatedActivity)
      }
    }
  },

  actions: {
    async fetchActivities({ commit }, { start, end }) {
      commit('SET_LOADING', true)
      try {
        const response = await ApiService.get(`/activities?start=${start}&end=${end}`)
        
        // Formater les activités
        const formattedActivities = response.map(activity => ({
          ...activity,
          date: activity.date.split('T')[0],
          details: {
            ...activity.details,
            heureDebut: activity.details?.heureDebut || '',
            heureFin: activity.details?.heureFin || ''
          }
        }))
        
        commit('SET_ACTIVITIES', formattedActivities)
        return formattedActivities
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
        const response = await ApiService.post('/activities', activityData)
        const newActivity = {
          ...activityData,
          id: response.id
        }
        commit('ADD_ACTIVITY', newActivity)
        return response
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updateActivity({ commit }, { id, data }) {
      try {
        await ApiService.put(`/activities/${id}`, data)
        commit('UPDATE_ACTIVITY', { id, ...data })
        return { id, ...data }
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
        console.error('Erreur lors de la suppression de l\'activité:', error)
        throw error
      }
    }
  }
} 