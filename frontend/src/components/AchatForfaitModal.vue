<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Achat de Forfait</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Client</label>
              <p class="form-control-static">{{ client.prenom }} {{ client.nom }}</p>
            </div>

            <div class="mb-3">
              <label class="form-label">Offre</label>
              <select class="form-control" v-model="selectedOffre" required>
                <option value="">Sélectionnez une offre</option>
                <option v-for="offre in offres" :key="offre.id" :value="offre">
                  {{ offre.nomoffre }} - {{ offre.prix }}€ ({{ offre.quantite }} séances)
                </option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading || !selectedOffre">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Acheter le forfait
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'AchatForfaitModal',
  
  props: {
    client: {
      type: Object,
      required: true
    }
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const store = useStore()
    const loading = ref(false)
    const selectedOffre = ref(null)
    const offres = ref([])

    onMounted(async () => {
      try {
        await store.dispatch('offres/fetchOffres')
        offres.value = store.getters['offres/allOffres']
      } catch (error) {
        console.error('Erreur lors du chargement des offres:', error)
      }
    })

    const handleSubmit = async () => {
      if (!selectedOffre.value) return

      loading.value = true
      try {
        const achatData = {
          client_id: props.client.id,
          offre_id: selectedOffre.value.id
        }
        emit('save', achatData)
      } catch (error) {
        console.error('Erreur lors de l\'achat:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      offres,
      selectedOffre,
      loading,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style> 