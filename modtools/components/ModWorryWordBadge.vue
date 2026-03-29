<template>
  <b-badge
    :variant="worrywordVariant"
    class="me-2 mb-2 p-2"
    style="font-size: 0.9rem"
  >
    <small v-if="isRegexPattern" class="me-1 text-muted">REGEX:</small>
    <small v-if="worryword?.type !== 'Review'" class="me-1 text-muted"
      >{{ worryword?.type?.toUpperCase() }}:</small
    >
    {{ displayText }}
    <b-button
      size="sm"
      variant="outline-danger"
      class="ms-2 p-1"
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
  worrywordid: {
    type: Number,
    required: true,
  },
})

const systemConfigStore = useSystemConfigStore()

const worryword = computed(() => {
  return systemConfigStore.worrywords.find((w) => w.id === props.worrywordid)
})

const showDeleteConfirm = ref(false)
const deleteConfirmMessage = ref('')

const isLoading = computed(() => {
  return systemConfigStore.isLoading
})

const isRegexPattern = computed(() => {
  return worryword.value?.keyword?.startsWith('REGEX:')
})

const displayText = computed(() => {
  return isRegexPattern.value
    ? worryword.value?.keyword?.substring(6)
    : worryword.value?.keyword
})

const worrywordVariant = computed(() => {
  // Color-code based on type first, then consider regex
  const isRegex = isRegexPattern.value

  switch (worryword.value?.type) {
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
  deleteConfirmMessage.value = `Are you sure you want to delete the worry word "${worryword.value?.keyword}"? This will affect system-wide message filtering and cannot be undone.`
  showDeleteConfirm.value = true
}

async function handleDelete() {
  await systemConfigStore.deleteWorryword(props.worrywordid)
  showDeleteConfirm.value = false
  deleteConfirmMessage.value = ''
}
</script>
