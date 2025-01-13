<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ offre ? 'Modifier' : 'Nouvelle' }} Offre
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Nom de l'offre</label>
              <input type="text" class="form-control" v-model="form.nomOffre" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Prix (€)</label>
              <input type="number" step="0.01" class="form-control" v-model.number="form.prix" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Quantité</label>
              <input type="number" class="form-control" v-model.number="form.quantite" required>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Enregistrer
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

export default {
  name: 'OffreModal',
  
  props: {
    offre: {
      type: Object,
      default: null
    }
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const loading = ref(false)
    const form = ref({
      nomOffre: '',
      prix: 0,
      quantite: 0
    })

    onMounted(() => {
      if (props.offre) {
        form.value = { ...props.offre }
      }
    })

    const handleSubmit = async () => {
      loading.value = true
      try {
        emit('save', form.value)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
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