<template>
  <select 
    class="form-control" 
    :value="modelValue" 
    @input="$emit('update:modelValue', $event.target.value)"
    :required="required"
  >
    <option value="" v-if="!required">Sélectionnez...</option>
    <option 
      v-for="value in enumValues" 
      :key="value" 
      :value="value"
    >
      {{ value }}
    </option>
  </select>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'EnumSelect',

  props: {
    enumName: {
      type: String,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue'],

  setup(props) {
    const store = useStore()
    const enumValues = ref([])

    const loadEnumValues = async () => {
      try {
        const enums = await store.dispatch('enums/fetchEnums')
        enumValues.value = enums[props.enumName] || []
      } catch (error) {
        console.error(`Erreur lors du chargement de l'enum ${props.enumName}:`, error)
      }
    }

    onMounted(loadEnumValues)

    return {
      enumValues
    }
  }
}
</script> 