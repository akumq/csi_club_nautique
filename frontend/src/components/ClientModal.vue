<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ client ? 'Modifier' : 'Nouveau' }} Client
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Nom</label>
              <input type="text" class="form-control" v-model="form.nom" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Prénom</label>
              <input type="text" class="form-control" v-model="form.prenom" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="form.email" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Téléphone</label>
              <input type="tel" class="form-control" v-model="form.telephone" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Adresse</label>
              <input type="text" class="form-control" v-model="form.adresse">
            </div>

            <div class="mb-3">
              <label class="form-label">Date de naissance</label>
              <input type="date" class="form-control" v-model="form.date_naissance">
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
  name: 'ClientModal',
  
  props: {
    client: {
      type: Object,
      default: null
    }
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const loading = ref(false)
    const form = ref({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      date_naissance: ''
    })

    onMounted(() => {
      if (props.client) {
        form.value = { ...props.client }
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