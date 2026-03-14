<template>
  <b-badge
    :variant="worrywordVariant"
    class="mr-2 mb-2 p-2"
    style="font-size: 0.9rem"
  >
    <small v-if="isRegexPattern" class="mr-1 text-muted">REGEX:</small>
    <small v-if="worryword.type !== 'Review'" class="mr-1 text-muted"
      >{{ worryword.type.toUpperCase() }}:</small
    >
    {{ displayText }}
    <b-button
      size="sm"
      variant="outline-danger"
      class="ml-2 p-1"
      :disabled="isLoading"
      @click="confirmDelete"
    >
      <v-icon icon="trash-alt" />
    </b-button>

    <ConfirmModal
      v-if="showDeleteConfirm"
      ref="confirmDeleteModal"
      title="Delete Worry Word"
      :message="deleteConfirmMessage"
      @confirm="handleDelete"
      @hidden="showDeleteConfirm = false"
    />
  </b-badge>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSystemConfigStore } from '~/stores/systemconfig'

const props = defineProps({
  worryword: {
    type: Object,
    required: true,
  },
})

const systemConfigStore = useSystemConfigStore()

const showDeleteConfirm = ref(false)
const deleteConfirmMessage = ref('')

const isLoading = computed(() => {
  return systemConfigStore.isLoading
})

const isRegexPattern = computed(() => {
  return props.worryword.keyword.startsWith('REGEX:')
})

const displayText = computed(() => {
  return isRegexPattern.value
    ? props.worryword.keyword.substring(6)
    : props.worryword.keyword
})

const worrywordVariant = computed(() => {
  // Color-code based on type first, then consider regex
  const isRegex = isRegexPattern.value

  switch (props.worryword.type) {
    case 'Regulated':
      return isRegex ? 'danger' : 'warning'
    case 'Reportable':
      return 'danger'
    case 'Medicine':
      return 'info'
    case 'Allowed':
      return 'success'
    case 'Review':
    default:
      return isRegex ? 'info' : 'secondary'
  }
})

function confirmDelete() {
  deleteConfirmMessage.value = `Are you sure you want to delete the worry word "${props.worryword.keyword}"? This will affect system-wide message filtering and cannot be undone.`
  showDeleteConfirm.value = true
}

async function handleDelete() {
  await systemConfigStore.deleteWorryword(props.worryword.id)
  showDeleteConfirm.value = false
  deleteConfirmMessage.value = ''
}
</script>
