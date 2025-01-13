import ApiService from '@/services/api.service'

export default {
  namespaced: true,
  
  state: {
    materials: [],
    loading: false,
    error: null
  },

  getters: {
    allMaterials: state => state.materials,
    availableMaterials: state => () => {
      // Modifier la logique si la date est nécessaire
      return state.materials.filter(m => m.disponible)
    },
    isLoading: state => state.loading,
    error: state => state.error,
    getMaterialById: state => id => state.materials.find(m => m.id === id)
  },

  mutations: {
    SET_MATERIALS(state, materials) {
      state.materials = materials
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    ADD_MATERIAL(state, material) {
      state.materials.push(material)
    },
    UPDATE_MATERIAL(state, updatedMaterial) {
      const index = state.materials.findIndex(m => m.id === updatedMaterial.id)
      if (index !== -1) {
        state.materials.splice(index, 1, updatedMaterial)
      }
    },
    DELETE_MATERIAL(state, id) {
      state.materials = state.materials.filter(m => m.id !== id)
    }
  },

  actions: {
    async fetchMateriels({ commit }) {
      commit('SET_LOADING', true)
      try {
        const materials = await ApiService.get('/materiels')
        commit('SET_MATERIALS', materials)
        return materials
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async createMaterial({ commit }, materialData) {
      try {
        const material = await ApiService.post('/materiels', materialData)
        const materials = await ApiService.get('/materiels')
        commit('SET_MATERIALS', materials)
        return material
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async updateMaterial({ commit }, { id, data }) {
      try {
        const material = await ApiService.put(`/materiels/${id}`, data)
        const materials = await ApiService.get('/materiels')
        commit('SET_MATERIALS', materials)
        return material
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async deleteMaterial({ commit }, id) {
      try {
        await ApiService.delete(`/materiels/${id}`)
        commit('DELETE_MATERIAL', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async checkAvailability({ commit }, { materialIds, date, timeSlot }) {
      try {
        const response = await ApiService.post('/materiels/check-availability', {
          materialIds,
          date,
          timeSlot
        })
        return response.available
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
} 