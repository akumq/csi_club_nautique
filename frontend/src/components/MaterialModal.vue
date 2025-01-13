<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ material ? 'Modifier' : 'Nouveau' }} Matériel
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Champs communs -->
            <div class="mb-3">
              <label class="form-label">Type de matériel</label>
              <select class="form-control" v-model="form.type" required @change="handleTypeChange">
                <option v-for="type in enums.EType_Materiel" :key="type" :value="type">
                  {{ formatEnumValue(type) }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Statut</label>
              <select class="form-control" v-model="form.statut" required>
                <option v-for="statut in enums.EStatut" :key="statut" :value="statut">
                  {{ formatEnumValue(statut) }}
                </option>
              </select>
            </div>

            <!-- Champs spécifiques selon le type -->
            <div v-if="form.type === 'Voile'" class="mb-3">
              <label class="form-label">Taille (m²)</label>
              <input 
                type="number" 
                class="form-control" 
                v-model.number="form.specificData.taille"
                required
                min="0"
                step="0.1"
              >
            </div>

            <div v-if="form.type === 'Flotteur'" class="mb-3">
              <label class="form-label">Capacité (L)</label>
              <input 
                type="number" 
                class="form-control" 
                v-model.number="form.specificData.capacite"
                required
                min="0"
              >
            </div>

            <div v-if="form.type === 'Bateau'" class="mb-3">
              <label class="form-label">Type de bateau</label>
              <select class="form-control" v-model="form.specificData.type" required>
                <option v-for="type in enums.EType_Bateau" :key="type" :value="type">
                  {{ formatEnumValue(type) }}
                </option>
              </select>
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
import ApiService from '@/services/api.service'

export default {
  name: 'MaterialModal',
  
  props: {
    material: {
      type: Object,
      default: null
    }
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const loading = ref(false)
    const enums = ref({
      EType_Materiel: [],
      EStatut: [],
      EType_Bateau: []
    })

    const form = ref({
      type: '',
      statut: '',
      specificData: {}
    })

    const handleTypeChange = () => {
      // Réinitialiser les données spécifiques lors du changement de type
      form.value.specificData = {}
    }

    const formatEnumValue = (value) => {
      return value
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    }

    const loadEnums = async () => {
      try {
        const response = await ApiService.get('/enum/enums')
        enums.value = response
        if (!props.material) {
          form.value.type = enums.value.EType_Materiel[0]
          form.value.statut = enums.value.EStatut[0]
        }
      } catch (error) {
        console.error('Erreur lors du chargement des enums:', error)
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        // Préparer les données selon le type de matériel
        const submitData = {
          type: form.value.type,
          statut: form.value.statut,
          taille: null,
          capacite: null,
          bateau_type: null
        }

        // Ajouter les données spécifiques selon le type
        switch (form.value.type) {
          case 'Voile':
            submitData.taille = Number(form.value.specificData.taille)
            break
          case 'Flotteur':
            submitData.capacite = Number(form.value.specificData.capacite)
            break
          case 'Bateau':
            submitData.bateau_type = form.value.specificData.type
            break
        }

        // Vérification des données requises
        if (form.value.type === 'Flotteur' && !submitData.capacite) {
          throw new Error('La capacité est requise pour un flotteur')
        }
        if (form.value.type === 'Voile' && !submitData.taille) {
          throw new Error('La taille est requise pour une voile')
        }
        if (form.value.type === 'Bateau' && !submitData.bateau_type) {
          throw new Error('Le type de bateau est requis')
        }

        emit('save', submitData)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
        alert(error.message || 'Une erreur est survenue lors de la sauvegarde')
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await loadEnums()
      if (props.material) {
        form.value.type = props.material.type
        form.value.statut = props.material.statut
        
        // Charger les données spécifiques selon le type
        switch (props.material.type) {
          case 'Voile':
            form.value.specificData = { taille: props.material.taille }
            break
          case 'Flotteur':
            form.value.specificData = { capacite: props.material.capacite }
            break
          case 'Bateau':
            form.value.specificData = { type: props.material.bateau_type }
            break
        }
      }
    })

    return {
      form,
      enums,
      loading,
      handleSubmit,
      handleTypeChange,
      formatEnumValue
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style> 