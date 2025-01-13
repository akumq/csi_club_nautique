import ApiService from '@/services/api.service'

export default {
  namespaced: true,

  state: {
    enums: {},
    loading: false,
    error: null
  },

  getters: {
    allEnums: state => state.enums,
    isLoading: state => state.loading,
    error: state => state.error
  },

  mutations: {
    SET_ENUMS(state, enums) {
      state.enums = enums
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async fetchEnums({ commit }) {
      commit('SET_LOADING', true)
      try {
        const enums = await ApiService.get('/enum/enums')
        commit('SET_ENUMS', enums)
        return enums
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async addEnumValue({ commit }, { enumName, value }) {
      try {
        await ApiService.post(`/enum/${enumName}/values`, { value })
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async deleteEnumValue({ commit }, { enumName, value }) {
      try {
        await ApiService.delete(`/enum/${enumName}/values/${value}`)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
} 