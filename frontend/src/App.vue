<template>
  <Navigation v-if="isAuthenticated" />
  <div id="app" class="container-fluid">
    <router-view></router-view>
  </div>
</template>

<script>
import Navigation from '@/components/Navigation.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    Navigation
  },
  computed: {
    ...mapGetters(['isAuthenticated'])
  }
}
</script> 