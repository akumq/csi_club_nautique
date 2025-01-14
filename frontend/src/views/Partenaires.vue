<template>
  <div class="main-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1><i class="fas fa-users"></i> Gestion des Partenaires</h1>
      <button class="btn btn-primary" @click="showModal()">
        <i class="fas fa-plus"></i> Nouveau Partenaire
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Remise</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="partenaire in partenaires" :key="partenaire.id">
                <td>{{ partenaire.id }}</td>
                <td>{{ partenaire.nomcamping }}</td>
                <td>{{ partenaire.remise * 100 }}%</td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="showModal(partenaire)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger" 
                    @click="deletePartenaire(partenaire.id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <PartenaireModal 
      v-if="showForm"
      :partenaire="selectedPartenaire"
      @save="handleSave"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import PartenaireModal from '@/components/PartenaireModal.vue'

export default {
  name: 'PartenairesView',

  components: {
    PartenaireModal
  },

  setup() {
    const store = useStore()
    const showForm = ref(false)
    const selectedPartenaire = ref(null)
    const partenaires = ref([])

    const fetchPartenaires = async () => {
      const response = await store.dispatch('partenaires/fetchPartenaires')
      partenaires.value = response
    }

    const showModal = (partenaire = null) => {
      selectedPartenaire.value = partenaire
      showForm.value = true
    }

    const closeModal = () => {
      showForm.value = false
      selectedPartenaire.value = null
    }

    const handleSave = async (partenaireData) => {
      if (selectedPartenaire.value) {
        await store.dispatch('partenaires/updatePartenaire', {
          id: selectedPartenaire.value.id,
          data: partenaireData
        })
      } else {
        await store.dispatch('partenaires/createPartenaire', partenaireData)
      }
      await fetchPartenaires()
      closeModal()
    }

    const deletePartenaire = async (id) => {
      await store.dispatch('partenaires/deletePartenaire', id)
      await fetchPartenaires()
    }

    onMounted(fetchPartenaires)

    return {
      partenaires,
      showForm,
      selectedPartenaire,
      showModal,
      closeModal,
      handleSave,
      deletePartenaire
    }
  }
}
</script> 