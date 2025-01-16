<template>
  <div class="main-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1><i class="fas fa-tools"></i> Gestion du Matériel</h1>
      <button class="btn btn-primary" @click="showModal()">
        <i class="fas fa-plus"></i> Nouveau Matériel
      </button>

    </div>

    <!-- Filtres -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Type de matériel</label>
              <select class="form-control" v-model="filters.type">
                <option value="">Tous</option>
                <option value="Voile">Voile</option>
                <option value="Flotteur">Flotteur</option>
                <option value="Bateau">Bateau</option>
                <option value="PiedMat">Pied de mât</option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Statut</label>
              <select class="form-control" v-model="filters.statut">
                <option value="">Tous</option>
                <option value="Disponible">Disponible</option>
                <option value="En maintenance">En maintenance</option>
                <option value="Hors service">Hors service</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste du matériel -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Caractéristiques</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="materiel in filteredMaterials" :key="materiel.id">
                <td>{{ materiel.id }}</td>
                <td>{{ materiel.type }}</td>
                <td>
                  <span 
                    class="badge"
                    :class="{
                      'bg-success': materiel.statut === 'Disponible',
                      'bg-warning': materiel.statut === 'En maintenance',
                      'bg-danger': materiel.statut === 'Hors service'
                    }"
                  >
                    {{ materiel.statut }}
                  </span>
                </td>
                <td>
                  <span v-if="materiel.type === 'Voile' && materiel.taille">
                    Taille: {{ materiel.taille }} m²
                  </span>
                  <span v-if="materiel.type === 'Flotteur' && materiel.capacite">
                    Capacité: {{ materiel.capacite }} L
                  </span>
                  <span v-if="materiel.type === 'Bateau' && materiel.bateau_type">
                    Type: {{ materiel.bateau_type }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-2"
                    @click="showModal(materiel)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-warning me-2"
                    @click="openRepairModal(materiel)"
                  >
                    <i class="fas fa-wrench"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(materiel)"
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

    <!-- Modals -->
    <MaterialModal 
      v-if="showForm"
      :material="selectedMaterial"
      @save="handleSave"
      @close="closeModal"
    />

    <MaintenanceModal 
      v-if="showMaintenanceForm"
      :material="selectedMaterial"
      @save="handleMaintenanceSave"
      @close="closeMaintenanceModal"
    />

    <RepairModal 
      v-if="showRepairForm"
      :materiel_id="selectedMaterial.id"
      @save="handleRepairSave"
      @close="closeRepairModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import MaterialModal from '@/components/MaterialModal.vue'
import MaintenanceModal from '@/components/MaintenanceModal.vue'
import RepairModal from '@/components/RepairModal.vue'

export default {
  name: 'MaterielsView',

  components: {
    MaterialModal,
    MaintenanceModal,
    RepairModal
  },

  setup() {
    const store = useStore()
    const showForm = ref(false)
    const showMaintenanceForm = ref(false)
    const showRepairForm = ref(false)
    const selectedMaterial = ref(null)
    const filters = ref({
      type: '',
      statut: ''
    })

    const materials = computed(() => store.getters['materials/allMaterials'])
    const filteredMaterials = computed(() => {
      return materials.value.filter(material => {
        if (filters.value.type && material.type !== filters.value.type) return false
        if (filters.value.statut && material.statut !== filters.value.statut) return false
        return true
      })
    })

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR')
    }

    const formatEtat = (etat) => {
      const etats = {
        disponible: 'Disponible',
        en_reparation: 'En réparation',
        hors_service: 'Hors service'
      }
      return etats[etat] || etat
    }

    const showModal = (material = null) => {
      selectedMaterial.value = material
      showForm.value = true
    }

    const closeModal = () => {
      showForm.value = false
      selectedMaterial.value = null
    }

    const showMaintenanceModal = (material) => {
      selectedMaterial.value = material
      showMaintenanceForm.value = true
    }

    const closeMaintenanceModal = () => {
      showMaintenanceForm.value = false
      selectedMaterial.value = null
    }

    const openRepairModal = (materiel) => {
      selectedMaterial.value = materiel
      showRepairForm.value = true
    }

    const closeRepairModal = () => {
      showRepairForm.value = false
      selectedMaterial.value = null
    }

    const handleRepairSave = async (repairData) => {
      try {
        repairData.materiel_id = selectedMaterial.value.id
        await store.dispatch('materials/createRepair', repairData)
        await store.dispatch('materials/fetchMateriels')
        closeRepairModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la réparation:', error)
      }
    }

    const handleSave = async (materialData) => {
      try {
        if (selectedMaterial.value) {
          await store.dispatch('materials/updateMaterial', {
            id: selectedMaterial.value.id,
            data: materialData
          })
        } else {
          await store.dispatch('materials/createMaterial', materialData)
        }
        await store.dispatch('materials/fetchMateriels')
        closeModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error)
      }
    }

    const handleMaintenanceSave = async (maintenanceData) => {
      try {
        await store.dispatch('materials/updateMaterial', {
          id: selectedMaterial.value.id,
          data: {
            ...selectedMaterial.value,
            derniereMaintenance: new Date(),
            etat: maintenanceData.etat,
            notesMaintenance: maintenanceData.notes
          }
        })
        await store.dispatch('materials/fetchMateriels')
        closeMaintenanceModal()
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la maintenance:', error)
      }
    }

    const confirmDelete = async (material) => {
      if (confirm(`Voulez-vous vraiment supprimer ce matériel (${material.type}) ?`)) {
        try {
          await store.dispatch('materials/deleteMaterial', material.id)
          await store.dispatch('materials/fetchMateriels')
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
        }
      }
    }

    onMounted(async () => {
      await store.dispatch('materials/fetchMateriels')
    })

    return {
      showForm,
      showMaintenanceForm,
      showRepairForm,
      selectedMaterial,
      filters,
      filteredMaterials,
      formatDate,
      formatEtat,
      showModal,
      closeModal,
      showMaintenanceModal,
      closeMaintenanceModal,
      handleSave,
      handleMaintenanceSave,
      confirmDelete,
      openRepairModal,
      closeRepairModal,
      handleRepairSave
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