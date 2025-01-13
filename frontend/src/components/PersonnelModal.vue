<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ personnel ? 'Modifier' : 'Nouveau' }} Personnel
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
              <label class="form-label">Type</label>
              <select class="form-control" v-model="form.type" required>
                <option value="moniteur">Moniteur</option>
                <option value="proprietaire">Propriétaire</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="form.mail" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Adresse</label>
              <input type="text" class="form-control" v-model="form.adresse" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Téléphone</label>
              <input type="tel" class="form-control" v-model="form.telephone" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Diplôme</label>
              <input type="text" class="form-control" v-model="form.diplome" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Permis</label>
              <input type="text" class="form-control" v-model="form.permis" required>
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
  name: 'PersonnelModal',
  
  props: {
    personnel: {
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
      type: 'moniteur',
      mail: '',
      adresse: '',
      telephone: '',
      diplome: '',
      permis: ''
    })

    onMounted(() => {
      if (props.personnel) {
        form.value = { ...props.personnel }
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