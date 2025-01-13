import ApiService from '@/services/api.service'

export default {
  namespaced: true,
  
  state: {
    personnel: [],
    moniteurs: [],
    loading: false,
    error: null
  },

  getters: {
    allPersonnel: state => state.personnel,
    allMoniteurs: state => state.moniteurs,
    isLoading: state => state.loading,
    error: state => state.error,
    getPersonnelById: state => id => state.personnel.find(p => p.id === id)
  },

  mutations: {
    SET_PERSONNEL(state, personnel) {
      state.personnel = personnel
    },
    SET_MONITEURS(state, moniteurs) {
      state.moniteurs = moniteurs
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    ADD_PERSONNEL(state, personnel) {
      state.personnel.push(personnel)
    },
    UPDATE_PERSONNEL(state, updatedPersonnel) {
      const index = state.personnel.findIndex(p => p.id === updatedPersonnel.id)
      if (index !== -1) {
        state.personnel.splice(index, 1, updatedPersonnel)
      }
    },
    DELETE_PERSONNEL(state, id) {
      state.personnel = state.personnel.filter(p => p.id !== id)
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
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchMoniteurs({ commit }) {
      commit('SET_LOADING', true)
      try {
        const moniteurs = await ApiService.get('/personnels?type=moniteur')
        commit('SET_MONITEURS', moniteurs)
        return moniteurs
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
        commit('ADD_PERSONNEL', personnel)
        return personnel
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updatePersonnel({ commit }, { id, data }) {
      try {
        const personnel = await ApiService.put(`/personnels/${id}`, data)
        commit('UPDATE_PERSONNEL', personnel)
        return personnel
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async deletePersonnel({ commit }, id) {
      try {
        await ApiService.delete(`/personnels/${id}`)
        commit('DELETE_PERSONNEL', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
} 