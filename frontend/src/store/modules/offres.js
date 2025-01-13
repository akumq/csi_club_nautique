import ApiService from '@/services/api.service'

export default {
  namespaced: true,
  
  state: {
    offres: [],
    loading: false,
    error: null
  },

  getters: {
    allOffres: state => state.offres,
    isLoading: state => state.loading,
    error: state => state.error
  },

  mutations: {
    SET_OFFRES(state, offres) {
      state.offres = offres
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async fetchOffres({ commit }) {
      commit('SET_LOADING', true)
      try {
        const offres = await ApiService.get('/offres')
        commit('SET_OFFRES', offres)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createOffre({ commit }, offreData) {
      try {
        const offre = await ApiService.post('/offres', offreData)
        const allOffres = await ApiService.get('/offres')
        commit('SET_OFFRES', allOffres)
        return offre
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updateOffre({ commit }, { id, data }) {
      try {
        const offre = await ApiService.put(`/offres/${id}`, data)
        const allOffres = await ApiService.get('/offres')
        commit('SET_OFFRES', allOffres)
        return offre
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async deleteOffre({ commit }, id) {
      try {
        await ApiService.delete(`/offres/${id}`)
        const allOffres = await ApiService.get('/offres')
        commit('SET_OFFRES', allOffres)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
} 