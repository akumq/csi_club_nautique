<template>
  <div class="main-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1><i class="fas fa-users"></i> Gestion des Clients</h1>
      <button class="btn btn-primary" @click="showModal()">
        <i class="fas fa-plus"></i> Nouveau Client
      </button>
    </div>

    <!-- Liste des clients -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Niveau</th>
                <th>Forfait</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in clients" :key="client.id">
                <td>{{ client.id }}</td>
                <td>{{ client.nom }}</td>
                <td>{{ client.prenom }}</td>
                <td>{{ client.mail }}</td>
                <td>{{ client.telephone }}</td>
                <td>
                  <span class="badge" :class="getNiveauBadgeClass(client.niveau)">
                    {{ client.niveau }}
                  </span>
                </td>
                <td>{{ client.quantiteforfait }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="showModal(client)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-success me-2"
                    @click="showAchatForfaitModal(client)"
                  >
                    <i class="fas fa-shopping-cart"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-info me-2"
                    @click="showFacturesModal(client)"
                  >
                    <i class="fas fa-file-invoice"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(client)"
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

    <!-- Modal Client -->
    <ClientModal 
      v-if="showForm"
      :client="selectedClient"
      @save="handleSave"
      @close="closeModal"
    />

    <!-- Modal Achat Forfait -->
    <AchatForfaitModal
      v-if="showAchatForm"
      :client="selectedClient"
      @save="handleAchatForfait"
      @close="closeAchatForfaitModal"
    />

    <FacturesClientModal
      v-if="showFactures"
      :client="selectedClient"
      @close="closeFacturesModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import ClientModal from '@/components/ClientModal.vue'
import AchatForfaitModal from '@/components/AchatForfaitModal.vue'
import FacturesClientModal from '@/components/FacturesClientModal.vue'

export default {
  name: 'ClientsView',

  components: {
    ClientModal,
    AchatForfaitModal,
    FacturesClientModal
  },

  setup() {
    const store = useStore()
    const showForm = ref(false)
    const showAchatForm = ref(false)
    const selectedClient = ref(null)
    const showFactures = ref(false)

    const clients = computed(() => store.getters['clients/allClients'])

    const getNiveauBadgeClass = (niveau) => {
      const classes = {
        'Débutant': 'bg-success',
        'Intermédiaire': 'bg-warning',
        'Avancé': 'bg-danger'
      }
      return classes[niveau] || 'bg-secondary'
    }

    const showModal = (client = null) => {
      selectedClient.value = client
      showForm.value = true
    }

    const closeModal = () => {
      showForm.value = false
      selectedClient.value = null
    }

    const handleSave = async (clientData) => {
      try {
        if (selectedClient.value) {
          await store.dispatch('clients/updateClient', {
            id: selectedClient.value.id,
            data: clientData
          })
        } else {
          await store.dispatch('clients/createClient', clientData)
        }
        await store.dispatch('clients/fetchClients')
        closeModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      }
    }

    const confirmDelete = async (client) => {
      if (confirm(`Voulez-vous vraiment supprimer le client ${client.prenom} ${client.nom} ?`)) {
        try {
          await store.dispatch('clients/deleteClient', client.id)
          await store.dispatch('clients/fetchClients')
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    const showAchatForfaitModal = (client) => {
      selectedClient.value = client
      showAchatForm.value = true
    }

    const closeAchatForfaitModal = () => {
      showAchatForm.value = false
      selectedClient.value = null
    }

    const handleAchatForfait = async (achatData) => {
      try {
        await store.dispatch('clients/achatForfait', achatData)
        await store.dispatch('clients/fetchClients')
        closeAchatForfaitModal()
      } catch (error) {
        console.error('Erreur lors de l\'achat du forfait:', error)
      }
    }

    const showFacturesModal = (client) => {
      selectedClient.value = client
      showFactures.value = true
    }

    const closeFacturesModal = () => {
      showFactures.value = false
      selectedClient.value = null
    }

    onMounted(async () => {
      await store.dispatch('clients/fetchClients')
    })

    return {
      showForm,
      selectedClient,
      clients,
      showModal,
      closeModal,
      handleSave,
      confirmDelete,
      getNiveauBadgeClass,
      showAchatForm,
      showAchatForfaitModal,
      closeAchatForfaitModal,
      handleAchatForfait,
      showFactures,
      showFacturesModal,
      closeFacturesModal
    }
  }
}
</script>

<style scoped>
.badge {
  font-size: 0.9em;
  padding: 0.5em 0.7em;
}
</style> 