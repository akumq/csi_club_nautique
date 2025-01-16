<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Ajouter en Réparation</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitRepair">
            <div class="mb-3">
              <label class="form-label">Élément</label>
              <input v-model="repair.element" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="repair.description" class="form-control" required></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Date de début</label>
              <input v-model="repair.dateDebut" type="date" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Date de fin</label>
              <input v-model="repair.dateFin" type="date" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Coût</label>
              <input v-model="repair.cout" type="number" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary">Enregistrer Réparation</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'RepairModal',
  
  emits: ['save', 'close'],

  props: {
    materiel_id: {
      type: Number,
      required: true
    }
  },

  setup(props, { emit }) {
    const store = useStore()
    const repair = ref({
      element: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      cout: '',
      materiel_id: props.materiel_id
    })

    const submitRepair = async () => {
      try {
        await store.dispatch('materials/createRepair', repair.value);
        emit('save', repair.value);
      } catch (error) {
        console.error('Erreur lors de la création de la réparation:', error);
      }
    }

    return {
      repair,
      submitRepair
    }
  }
}
</script> 