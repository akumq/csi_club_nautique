<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ActivitiesModal',
  
  props: {
    client: {
      type: Object,
      required: true
    }
  },

  emits: ['close'],

  setup(props) {
    const store = useStore()
    const activities = ref([])

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR')
    }

    onMounted(async () => {
      // Retirez l'appel à fetchActivitiesByClient
      // activities.value = await store.dispatch('activities/fetchActivitiesByClient', props.client.id)
    })

    return {
      activities,
      formatDate
    }
  }
}
</script> 