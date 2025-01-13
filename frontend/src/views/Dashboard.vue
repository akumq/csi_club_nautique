<template>
  <div class="main-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Tableau de bord</h1>
    </div>
    <Calendar />
  </div>
</template>

<script>
import Calendar from '@/components/Calendar.vue'

export default {
  name: 'DashboardView',
  components: {
    Calendar
  }
}
</script> 