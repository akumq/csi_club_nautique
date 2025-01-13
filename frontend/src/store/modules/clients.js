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
    },
    ADD_CLIENT(state, client) {
      state.clients.push(client)
    },
    UPDATE_CLIENT(state, updatedClient) {
      const index = state.clients.findIndex(c => c.id === updatedClient.id)
      if (index !== -1) {
        state.clients.splice(index, 1, updatedClient)
      }
    },
    DELETE_CLIENT(state, id) {
      state.clients = state.clients.filter(c => c.id !== id)
    }
  },

  actions: {
    async fetchClients({ commit }) {
      commit('SET_LOADING', true)
      try {
        const clients = await ApiService.get('/clients')
        commit('SET_CLIENTS', clients)
        return clients
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createClient({ commit }, clientData) {
      try {
        const client = await ApiService.post('/clients', clientData)
        commit('ADD_CLIENT', client)
        return client
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updateClient({ commit }, { id, data }) {
      try {
        const client = await ApiService.put(`/clients/${id}`, data)
        commit('UPDATE_CLIENT', client)
        return client
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async deleteClient({ commit }, id) {
      try {
        await ApiService.delete(`/clients/${id}`)
        commit('DELETE_CLIENT', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
} 