import ApiService from '@/services/api.service'

export default {
  namespaced: true,

  state: {
    partenaires: []
  },

  getters: {
    allPartenaires: state => state.partenaires
  },

  mutations: {
    SET_PARTENAIRES(state, partenaires) {
      state.partenaires = partenaires
    }
  },

  actions: {
    async fetchPartenaires({ commit }) {
      try {
        const response = await ApiService.get('/partenaires')
        commit('SET_PARTENAIRES', response)
        return response
      } catch (error) {
        console.error('Erreur lors du chargement des partenaires:', error)
        throw error
      }
    },

    async createPartenaire({ dispatch }, partenaireData) {
      try {
        await ApiService.post('/partenaires', partenaireData)
        await dispatch('fetchPartenaires')
      } catch (error) {
        console.error('Erreur lors de la création du partenaire:', error)
        throw error
      }
    },

    async updatePartenaire({ dispatch }, { id, data }) {
      try {
        await ApiService.put(`/partenaires/${id}`, data)
        await dispatch('fetchPartenaires')
      } catch (error) {
        console.error('Erreur lors de la mise à jour du partenaire:', error)
        throw error
      }
    },

    async deletePartenaire({ dispatch }, id) {
      try {
        await ApiService.delete(`/partenaires/${id}`)
        await dispatch('fetchPartenaires')
      } catch (error) {
        console.error('Erreur lors de la suppression du partenaire:', error)
        throw error
      }
    }
  }
} 