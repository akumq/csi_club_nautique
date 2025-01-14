<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ partenaire ? 'Modifier' : 'Ajouter' }} Partenaire</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Nom du Camping</label>
              <input type="text" class="form-control" v-model="form.nomCamping" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Remise</label>
              <input type="range" class="form-range" v-model.number="form.remise" min="0" max="1" step="0.01" />
              <p>{{ (form.remise * 100).toFixed(0) }}%</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
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
  name: 'PartenaireModal',

  props: {
    partenaire: {
      type: Object,
      default: null
    }
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const form = ref({
      nomCamping: '',
      remise: 0.1 // Valeur par défaut à 10%
    })

    onMounted(() => {
      if (props.partenaire) {
        form.value = { ...props.partenaire }
      }
    })

    const handleSubmit = () => {
      emit('save', form.value)
    }

    return {
      form,
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