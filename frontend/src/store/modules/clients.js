import ApiService from '@/services/api.service'

export default {
  namespaced: true,
  
  state: {
    clients: []
  },

  getters: {
    allClients: state => state.clients,
    getClientById: (state) => (id) => {
      return state.clients.find(client => client.id === id)
    }
  },

  mutations: {
    SET_CLIENTS(state, clients) {
      state.clients = clients;
    }
  },

  actions: {
    async fetchClients({ commit }) {
      try {
        const response = await ApiService.get('/clients')
        commit('SET_CLIENTS', response)
        console.log('Clients récupérés:', response);
        return response
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error)
        throw error
      }
    }
  }
} 