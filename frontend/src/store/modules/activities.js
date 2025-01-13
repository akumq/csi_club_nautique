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
    activitiesByDate: state => date => {
      return state.activities.filter(activity => {
        const activityDate = new Date(activity.date)
        return activityDate.toDateString() === date.toDateString()
      })
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
    async fetchActivities({ commit }, { start, end }) {
      commit('SET_LOADING', true)
      try {
        const activities = await ApiService.get('/activities', {
          params: { start, end }
        })
        commit('SET_ACTIVITIES', activities)
        return activities
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createActivity({ commit }, activityData) {
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
    }
  }
} 