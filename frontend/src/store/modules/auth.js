import ApiService from '@/services/api.service'

export default {
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  },

  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user
  },

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_USER(state, user) {
      state.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
  },

  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await ApiService.post('/auth/login', credentials)
        commit('SET_TOKEN', response.token)
        commit('SET_USER', response.user)
        return response
      } catch (error) {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
        throw error
      }
    },

    async logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
    }
  }
} 