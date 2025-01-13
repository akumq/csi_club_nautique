<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header text-center">
            <h3>Connexion</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="alert alert-danger" v-if="error">{{ error }}</div>
              <div class="mb-3">
                <label for="username" class="form-label">Nom d'utilisateur</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username" 
                  v-model="form.username" 
                  required
                >
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Mot de passe</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="form.password" 
                  required
                >
              </div>
              <button 
                type="submit" 
                class="btn btn-primary w-100"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Connexion
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const form = ref({
      username: '',
      password: ''
    })
    const error = ref('')
    const loading = ref(false)

    const handleSubmit = async () => {
      try {
        loading.value = true
        error.value = ''
        await store.dispatch('login', form.value)
        router.push('/')
      } catch (err) {
        error.value = err.response?.data?.message || 'Erreur de connexion'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      error,
      loading,
      handleSubmit
    }
  }
}
</script> 