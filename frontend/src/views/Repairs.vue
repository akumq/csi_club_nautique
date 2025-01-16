<template>
  <div class="main-content">
    <h1><i class="fas fa-wrench"></i> Matériels en Réparation</h1>
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Élément</th>
                <th>Description</th>
                <th>Coût</th>
                <th>Type de Matériel</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="repair in repairs" :key="repair.id">
                <td>{{ repair.id }}</td>
                <td>{{ repair.element }}</td>
                <td>{{ repair.description }}</td>
                <td>{{ repair.cout }}</td>
                <td>{{ repair.materiel_type }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteRepair(repair.id)"
                  >
                    <i class="fas fa-trash"></i> Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'RepairsView',

  setup() {
    const store = useStore()
    const repairs = ref([])

    const fetchRepairs = async () => {
      repairs.value = await store.dispatch('materials/fetchRepairs')
    }

    const deleteRepair = async (id) => {
      if (confirm('Voulez-vous vraiment supprimer cette réparation ?')) {
        try {
          await store.dispatch('materials/deleteRepair', id)
          await fetchRepairs() // Recharger les réparations après la suppression
        } catch (error) {
          console.error('Erreur lors de la suppression de la réparation:', error)
        }
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR')
    }

    onMounted(fetchRepairs)

    return {
      repairs,
      deleteRepair,
      formatDate
    }
  }
}
</script> 