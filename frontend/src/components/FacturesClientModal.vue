<template>
  <div class="modal fade show" style="display: block">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Factures de {{ client.prenom }} {{ client.nom }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Offre</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Montant total</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="facture in factures" :key="facture.id">
                  <td>{{ formatDate(facture.date_facture) }}</td>
                  <td>{{ facture.nomoffre }}</td>
                  <td>{{ facture.quantite }}</td>
                  <td>{{ facture.prix }}€</td>
                  <td>{{ facture.montant }}€</td>
                  <td>
                    <span class="badge" :class="getEtatBadgeClass(facture.etat)">
                      {{ facture.etat }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'FacturesClientModal',
  
  props: {
    client: {
      type: Object,
      required: true
    }
  },

  emits: ['close'],

  setup(props) {
    const store = useStore()
    const factures = ref([])

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getEtatBadgeClass = (etat) => {
      const classes = {
        'Actif': 'bg-success',
        'Annulé': 'bg-danger',
        'Terminé': 'bg-secondary'
      }
      return classes[etat] || 'bg-secondary'
    }

    onMounted(async () => {
      try {
        const result = await store.dispatch('clients/fetchClientFactures', props.client.id)
        factures.value = result
      } catch (error) {
        console.error('Erreur lors du chargement des factures:', error)
      }
    })

    return {
      factures,
      formatDate,
      getEtatBadgeClass
    }
  }
}
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.badge {
  font-size: 0.9em;
  padding: 0.5em 0.7em;
}
</style> 