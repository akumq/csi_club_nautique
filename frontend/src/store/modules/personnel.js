import ApiService from '@/services/api.service'

export default {
  namespaced: true,
  
  state: {
    personnel: [],
    loading: false,
    error: null
  },

  getters: {
    allPersonnel: state => state.personnel,
    isLoading: state => state.loading,
    error: state => state.error
  },

  mutations: {
    SET_PERSONNEL(state, personnel) {
      state.personnel = personnel
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async fetchPersonnel({ commit }) {
      commit('SET_LOADING', true)
      try {
        const personnel = await ApiService.get('/personnels')
        commit('SET_PERSONNEL', personnel)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createPersonnel({ commit }, personnelData) {
      try {
        const personnel = await ApiService.post('/personnels', personnelData)
        const allPersonnel = await ApiService.get('/personnels')
        commit('SET_PERSONNEL', allPersonnel)
        return personnel
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updatePersonnel({ commit }, { id, data }) {
      try {
        const personnel = await ApiService.put(`/personnels/${id}`, data)
        const allPersonnel = await ApiService.get('/personnels')
        commit('SET_PERSONNEL', allPersonnel)
        return personnel
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async deletePersonnel({ commit }, id) {
      try {
        await ApiService.delete(`/personnels/${id}`)
        const allPersonnel = await ApiService.get('/personnels')
        commit('SET_PERSONNEL', allPersonnel)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
} 