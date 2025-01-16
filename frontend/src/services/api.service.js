import axios from 'axios'
import store from '@/store'
import router from '@/router'

const apiClient = axios.create({
  baseURL: ('http://localhost:3000') + '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

apiClient.interceptors.request.use(config => {
  const token = store.state.auth.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      store.dispatch('logout')
      router.push('/login')
    } else if (error.response?.status === 403) {
      console.error('Accès interdit:', error.response.data.message);
      store.dispatch('logout')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default {
  async get(url) {
    try {
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  },

  async post(url, data) {
    try {
      const response = await apiClient.post(url, data)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  },

  async put(url, data) {
    try {
      const response = await apiClient.put(url, data)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  },

  async delete(url) {
    try {
      const response = await apiClient.delete(url)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  },

  handleError(error) {
    console.error('API Error:', error)
  }
} 