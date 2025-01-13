<template>
  <div class="main-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1><i class="fas fa-tags"></i> Gestion des Offres</h1>
      <button class="btn btn-primary" @click="showModal()">
        <i class="fas fa-plus"></i> Nouvelle Offre
      </button>
    </div>

    <!-- Liste des offres -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom de l'offre</th>
                <th>Prix</th>
                <th>Quantité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="offre in offres" :key="offre.id">
                <td>{{ offre.id }}</td>
                <td>{{ offre.nomoffre }}</td>
                <td>{{ offre.prix }}€</td>
                <td>{{ offre.quantite }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="showModal(offre)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(offre)"
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

    <!-- Modal Offre -->
    <OffreModal 
      v-if="showForm"
      :offre="selectedOffre"
      @save="handleSave"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import OffreModal from '@/components/OffreModal.vue'

export default {
  name: 'OffresView',

  components: {
    OffreModal
  },

  setup() {
    const store = useStore()
    const showForm = ref(false)
    const selectedOffre = ref(null)

    const offres = computed(() => store.getters['offres/allOffres'])

    const showModal = (offre = null) => {
      selectedOffre.value = offre
      showForm.value = true
    }

    const closeModal = () => {
      showForm.value = false
      selectedOffre.value = null
    }

    const handleSave = async (offreData) => {
      try {
        if (selectedOffre.value) {
          await store.dispatch('offres/updateOffre', {
            id: selectedOffre.value.id,
            data: offreData
          })
        } else {
          await store.dispatch('offres/createOffre', offreData)
        }
        await store.dispatch('offres/fetchOffres')
        closeModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      }
    }

    const confirmDelete = async (offre) => {
      if (confirm(`Voulez-vous vraiment supprimer l'offre "${offre.nomoffre}" ?`)) {
        try {
          await store.dispatch('offres/deleteOffre', offre.id)
          await store.dispatch('offres/fetchOffres')
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    onMounted(async () => {
      await store.dispatch('offres/fetchOffres')
    })

    return {
      showForm,
      selectedOffre,
      offres,
      showModal,
      closeModal,
      handleSave,
      confirmDelete
    }
  }
}
</script> 