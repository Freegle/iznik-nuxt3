<template>
  <div>
    <ModMicrovolunteeringModal
      v-if="showMicrovolunteeringModal"
      ref="microvolunteering"
      :user="user"
      :item-ids="itemIds"
      @hidden="showMicrovolunteeringModal = false"
    />
    <b-button variant="link" @click="showModal"> View </b-button>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
})

const showMicrovolunteeringModal = ref(false)
const microvolunteering = ref(null)

const itemIds = computed(() => {
  return props.items.map((m) => m.id)
})

function showModal() {
  showMicrovolunteeringModal.value = true
  microvolunteering.value?.show()
}
</script>
