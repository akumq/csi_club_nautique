<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        Club Nautique
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">
              <i class="fas fa-home"></i> Accueil
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/clients">
              <i class="fas fa-users"></i> Clients
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/materiels">
              <i class="fas fa-tools"></i> Matériels
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/reparations">
              <i class="fas fa-wrench"></i> Réparations
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/personnel">
              <i class="fas fa-user-tie"></i> Personnel
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/partenaires">
              <i class="fas fa-users"></i> Partenaires
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/offres" class="nav-link">
              <i class="fas fa-tags"></i> Offres
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/parametres" class="nav-link">
              <i class="fas fa-cogs"></i> Paramètres
            </router-link>
          </li>
        </ul>
        
        <ul class="navbar-nav">
          <button class="btn btn-outline-danger" href="#" @click.prevent="handleLogout">
            <i class="fas fa-sign-out-alt"></i> Déconnexion
          </button>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'NavigationBar',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const currentUser = computed(() => store.getters.currentUser)
    const isAdmin = computed(() => store.getters['hasRole']('administrateur'))
    
    const handleLogout = async () => {
      await store.dispatch('logout')
      router.push('/login')
    }
    
    return {
      currentUser,
      isAdmin,
      handleLogout
    }
  }
}
</script> 