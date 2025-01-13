<template>
  <div class="main-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1><i class="fas fa-user-tie"></i> Gestion du Personnel</h1>
      <button class="btn btn-primary" @click="showModal()">
        <i class="fas fa-plus"></i> Nouveau Personnel
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
                <th>Prénom</th>
                <th>Type</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="person in personnel" :key="person.id">
                <td>{{ person.id }}</td>
                <td>{{ person.nom }}</td>
                <td>{{ person.prenom }}</td>
                <td>{{ person.type }}</td>
                <td>{{ person.email }}</td>
                <td>{{ person.telephone }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="showModal(person)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(person)"
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

    <!-- Modal -->
    <div v-if="showForm" class="modal fade show" style="display: block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ selectedPerson ? 'Modifier' : 'Nouveau' }} Personnel
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Type</label>
                <select class="form-control" v-model="form.type" required>
                  <option value="moniteur">Moniteur</option>
                  <option value="secretaire">Secrétaire</option>
                  <option value="proprietaire">Propriétaire</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Nom</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.nom"
                  required
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Prénom</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.prenom"
                  required
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  v-model="form.email"
                  required
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Téléphone</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  v-model="form.telephone"
                  required
                >
              </div>

              <!-- Champs spécifiques pour les moniteurs -->
              <template v-if="form.type === 'moniteur'">
                <div class="mb-3">
                  <label class="form-label">Spécialités</label>
                  <select 
                    class="form-control" 
                    v-model="form.specialites" 
                    multiple
                  >
                    <option value="voile">Voile</option>
                    <option value="planche">Planche à voile</option>
                    <option value="catamaran">Catamaran</option>
                  </select>
                </div>
              </template>

              <div class="modal-footer">
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  @click="closeModal"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span 
                    v-if="loading" 
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  Enregistrer
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
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Personnel',

  setup() {
    const store = useStore()
    const showForm = ref(false)
    const loading = ref(false)
    const selectedPerson = ref(null)
    const form = ref({
      type: 'moniteur',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      specialites: []
    })

    const personnel = computed(() => store.getters['personnel/allPersonnel'])

    const showModal = (person = null) => {
      selectedPerson.value = person
      if (person) {
        form.value = { ...person }
      } else {
        form.value = {
          type: 'moniteur',
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          specialites: []
        }
      }
      showForm.value = true
    }

    const closeModal = () => {
      showForm.value = false
      selectedPerson.value = null
    }

    const handleSubmit = async () => {
      loading.value = true
      try {
        if (selectedPerson.value) {
          await store.dispatch('personnel/updatePersonnel', {
            id: selectedPerson.value.id,
            data: form.value
          })
        } else {
          await store.dispatch('personnel/createPersonnel', form.value)
        }
        closeModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      } finally {
        loading.value = false
      }
    }

    const confirmDelete = async (person) => {
      if (confirm(`Voulez-vous vraiment supprimer ${person.prenom} ${person.nom} ?`)) {
        try {
          await store.dispatch('personnel/deletePersonnel', person.id)
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    onMounted(async () => {
      await store.dispatch('personnel/fetchPersonnel')
    })

    return {
      personnel,
      showForm,
      loading,
      selectedPerson,
      form,
      showModal,
      closeModal,
      handleSubmit,
      confirmDelete
    }
  }
}
</script> 