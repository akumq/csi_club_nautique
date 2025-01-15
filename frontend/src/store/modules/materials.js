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
      console.log('État des matériels:', state.materials)
      // Retourner tous les matériels pour l'instant, sans filtrage
      return state.materials
    },
    isLoading: state => state.loading,
    error: state => state.error,
    getMaterielById: state => id => state.materials.find(m => m.id === id)
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
    },
    UPDATE_MATERIAL_STATUS(state, { id, status }) {
      const material = state.materials.find(m => m.id === id);
      if (material) {
        material.statut = status; // Met à jour le statut du matériel
      }
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
    },

    async fetchAvailableMaterials({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await ApiService.get('/materiels');
        commit('SET_MATERIALS', response);
        return response;
      } catch (error) {
        console.error('Erreur lors du chargement des matériels:', error);
        commit('SET_ERROR', error.message);
        return []; // Retourner un tableau vide en cas d'erreur
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async updateMaterialStatus({ commit }, { id, status }) {
      try {
        await ApiService.put(`/materiels/${id}`, { statut: status });
        commit('UPDATE_MATERIAL_STATUS', { id, status });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut du matériel:', error);
        throw error;
      }
    }
  }
} 