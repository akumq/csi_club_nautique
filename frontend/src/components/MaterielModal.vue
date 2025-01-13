<template>
  <!-- ... -->
  <div class="mb-3">
    <label class="form-label">Type</label>
    <EnumSelect
      enum-name="EType_Materiel"
      v-model="form.type"
      required
    />
  </div>
  <div class="mb-3">
    <label class="form-label">État</label>
    <EnumSelect
      enum-name="EStatut"
      v-model="form.etat"
      required
    />
  </div>
  <!-- ... -->
</template>

<script>
import { ref, onMounted } from 'vue'
import EnumSelect from '@/components/EnumSelect.vue'

export default {
  name: 'MaterielModal',
  
  components: {
    EnumSelect
  },
  // ...
}
</script> 