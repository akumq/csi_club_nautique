<template>
  <div class="main-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1><i class="fas fa-cogs"></i> Paramètres</h1>
    </div>

    <div class="row">
      <div class="col-md-6 mb-4" v-for="(values, enumName) in enums" :key="enumName">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ formatEnumName(enumName) }}</h5>
            <button class="btn btn-sm btn-primary" @click="showAddModal(enumName)">
              <i class="fas fa-plus"></i> Ajouter
            </button>
          </div>
          <div class="card-body">
            <ul class="list-group">
              <li v-for="value in values" :key="value" 
                  class="list-group-item d-flex justify-content-between align-items-center">
                {{ value }}
                <button class="btn btn-sm btn-danger" @click="confirmDelete(enumName, value)">
                  <i class="fas fa-trash"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajout -->
    <div class="modal fade show" v-if="showModal" style="display: block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Ajouter une valeur à {{ formatEnumName(selectedEnum) }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Nouvelle valeur</label>
                <input type="text" class="form-control" v-model="newValue" required>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">
                  Annuler
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ParametresView',

  setup() {
    const store = useStore()
    const enums = ref({})
    const showModal = ref(false)
    const selectedEnum = ref(null)
    const newValue = ref('')
    const loading = ref(false)

    const formatEnumName = (name) => {
      return name.replace('E', '').replace('_', ' ')
    }

    const showAddModal = (enumName) => {
      selectedEnum.value = enumName
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      selectedEnum.value = null
      newValue.value = ''
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        await store.dispatch('enums/addEnumValue', {
          enumName: selectedEnum.value,
          value: newValue.value
        })
        await loadEnums()
        closeModal()
      } catch (error) {
        console.error('Erreur lors de l\'ajout:', error)
      } finally {
        loading.value = false
      }
    }

    const confirmDelete = async (enumName, value) => {
      if (confirm(`Voulez-vous vraiment supprimer la valeur "${value}" ?`)) {
        try {
          await store.dispatch('enums/deleteEnumValue', {
            enumName,
            value
          })
          await loadEnums()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    const loadEnums = async () => {
      try {
        const result = await store.dispatch('enums/fetchEnums')
        enums.value = result
      } catch (error) {
        console.error('Erreur lors du chargement des enums:', error)
      }
    }

    onMounted(loadEnums)

    return {
      enums,
      showModal,
      selectedEnum,
      newValue,
      loading,
      formatEnumName,
      showAddModal,
      closeModal,
      handleSubmit,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style> 