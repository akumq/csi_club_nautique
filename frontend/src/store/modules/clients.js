import ApiService from '@/services/api.service'

export default {
  namespaced: true,
  
  state: {
    clients: [],
    loading: false,
    error: null
  },

  getters: {
    allClients: state => state.clients,
    isLoading: state => state.loading,
    error: state => state.error
  },

  mutations: {
    SET_CLIENTS(state, clients) {
      state.clients = clients
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async fetchClients({ commit }) {
      commit('SET_LOADING', true)
      try {
        const clients = await ApiService.get('/clients')
        commit('SET_CLIENTS', clients)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createClient({ commit }, clientData) {
      try {
        const client = await ApiService.post('/clients', clientData)
        const allClients = await ApiService.get('/clients')
        commit('SET_CLIENTS', allClients)
        return client
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updateClient({ commit }, { id, data }) {
      try {
        const client = await ApiService.put(`/clients/${id}`, data)
        const allClients = await ApiService.get('/clients')
        commit('SET_CLIENTS', allClients)
        return client
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async deleteClient({ commit }, id) {
      try {
        await ApiService.delete(`/clients/${id}`)
        const allClients = await ApiService.get('/clients')
        commit('SET_CLIENTS', allClients)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
} 