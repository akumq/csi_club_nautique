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
              <input type="email" class="form-control" v-model="form.mail" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Téléphone</label>
              <input type="tel" class="form-control" v-model="form.telephone" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Niveau</label>
              <EnumSelect
                enum-name="ENiveau"
                v-model="form.niveau"
                required
              />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ client ? 'Mettre à jour' : 'Créer' }}
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
import EnumSelect from '@/components/EnumSelect.vue'

export default {
  name: 'ClientModal',
  
  props: {
    client: {
      type: Object,
      default: null
    }
  },

  emits: ['save', 'close'],

  components: {
    EnumSelect
  },

  setup(props, { emit }) {
    const loading = ref(false)
    const form = ref({
      nom: '',
      prenom: '',
      mail: '',
      telephone: '',
      niveau: 'Débutant',
      quantiteforfait: 0
    })

    onMounted(() => {
      if (props.client) {
        form.value = { ...props.client }
      }
    })

    const handleSubmit = async () => {
      loading.value = true
      try {
        const formData = { ...form.value }
        if (!props.client) {
          formData.quantiteforfait = 0
        }
        emit('save', formData)
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