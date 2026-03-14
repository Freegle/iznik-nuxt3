<template>
  <b-badge
    :variant="spamKeywordVariant"
    class="mr-2 mb-2 p-2"
    style="font-size: 0.9rem"
  >
    <small v-if="spamKeyword.type === 'Regex'" class="mr-1 text-muted"
      >REGEX:</small
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
      title="Delete Spam Keyword"
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
  spamKeyword: {
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

const displayText = computed(() => {
  return props.spamKeyword.word
})

const spamKeywordVariant = computed(() => {
  // Color-code based on action: Review, Spam, Whitelist
  switch (props.spamKeyword.action) {
    case 'Review':
      return 'warning'
    case 'Spam':
      return 'danger'
    case 'Whitelist':
      return 'success'
    default:
      return 'secondary'
  }
})

function confirmDelete() {
  deleteConfirmMessage.value = `Are you sure you want to delete the spam keyword "${props.spamKeyword.word}"? This will affect system-wide message filtering and cannot be undone.`
  showDeleteConfirm.value = true
}

async function handleDelete() {
  await systemConfigStore.deleteSpamKeyword(props.spamKeyword.id)
  showDeleteConfirm.value = false
  deleteConfirmMessage.value = ''
}
</script>
