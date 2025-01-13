import ApiService from '@/services/api.service'

export default {
  namespaced: true,
  
  state: {
    clients: [],
    clientFactures: []
  },

  getters: {
    allClients: state => state.clients,
    getClientById: (state) => (id) => {
      return state.clients.find(client => client.id === id)
    },
    getClientFactures: state => state.clientFactures
  },

  mutations: {
    SET_CLIENTS(state, clients) {
      state.clients = clients;
    },
    SET_CLIENT_FACTURES(state, factures) {
      state.clientFactures = factures;
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
    },
    async fetchClientFactures({ commit }, clientId) {
      try {
        const response = await ApiService.get(`/clients/${clientId}/factures`)
        commit('SET_CLIENT_FACTURES', response)
        console.log('Factures récupérées:', response);
        return response
      } catch (error) {
        console.error('Erreur lors du chargement des factures:', error)
        throw error
      }
    },
    async achatForfait( achatData) {
      try {
        const response = await ApiService.post('/clients/achat-forfait', achatData)
        console.log('Achat de forfait réussi:', response);
        return response
      } catch (error) {
        console.error('Erreur lors de l\'achat du forfait:', error)
        throw error
      }
    }
  }
} 