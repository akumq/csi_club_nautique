import ApiService from './api.service'

export default {
  async login(credentials) {
    return ApiService.post('/auth/login', credentials)
  },

  async register(userData) {
    return ApiService.post('/auth/register', userData)
  },

  async getCurrentUser() {
    return ApiService.get('/auth/me')
  }
} 