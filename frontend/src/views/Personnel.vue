<template>
  <div class="main-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1><i class="fas fa-user-tie"></i> Gestion du Personnel</h1>
      <button class="btn btn-primary" @click="showModal()">
        <i class="fas fa-plus"></i> Nouveau Personnel
      </button>
    </div>

    <!-- Liste du personnel -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Type</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Diplôme</th>
                <th>Permis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="personnel in personnels" :key="personnel.id">
                <td>{{ personnel.id }}</td>
                <td>{{ personnel.nom }}</td>
                <td>{{ personnel.prenom }}</td>
                <td>{{ personnel.type }}</td>
                <td>{{ personnel.mail }}</td>
                <td>{{ personnel.telephone }}</td>
                <td>{{ personnel.diplome }}</td>
                <td>{{ personnel.permis }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="showModal(personnel)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(personnel)"
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

    <!-- Modal Personnel -->
    <PersonnelModal 
      v-if="showForm"
      :personnel="selectedPersonnel"
      @save="handleSave"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import PersonnelModal from '@/components/PersonnelModal.vue'

export default {
  name: 'PersonnelView',

  components: {
    PersonnelModal
  },

  setup() {
    const store = useStore()
    const showForm = ref(false)
    const selectedPersonnel = ref(null)

    const personnels = computed(() => store.getters['personnel/allPersonnel'])

    const showModal = (personnel = null) => {
      selectedPersonnel.value = personnel
      showForm.value = true
    }

    const closeModal = () => {
      showForm.value = false
      selectedPersonnel.value = null
    }

    const handleSave = async (personnelData) => {
      try {
        if (selectedPersonnel.value) {
          await store.dispatch('personnel/updatePersonnel', {
            id: selectedPersonnel.value.id,
            data: personnelData
          })
        } else {
          await store.dispatch('personnel/createPersonnel', personnelData)
        }
        await store.dispatch('personnel/fetchPersonnel')
        closeModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      }
    }

    const confirmDelete = async (personnel) => {
      if (confirm(`Voulez-vous vraiment supprimer ${personnel.prenom} ${personnel.nom} du personnel ?`)) {
        try {
          await store.dispatch('personnel/deletePersonnel', personnel.id)
          await store.dispatch('personnel/fetchPersonnel')
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    onMounted(async () => {
      await store.dispatch('personnel/fetchPersonnel')
    })

    return {
      showForm,
      selectedPersonnel,
      personnels,
      showModal,
      closeModal,
      handleSave,
      confirmDelete
    }
  }
}
</script> 