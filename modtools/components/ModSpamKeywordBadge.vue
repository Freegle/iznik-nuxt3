<template>
  <b-badge
    :variant="spamKeywordVariant"
    class="mr-2 mb-2 p-2"
    style="font-size: 0.9rem"
  >
    <small v-if="spamKeyword.type === 'Regex'" class="mr-1 text-muted">REGEX:</small>
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

<script>
import { useSystemConfigStore } from '../stores/systemconfig'

export default {
  name: 'ModSpamKeywordBadge',
  props: {
    spamKeyword: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const systemConfigStore = useSystemConfigStore()
    return { systemConfigStore }
  },
  data() {
    return {
      showDeleteConfirm: false,
      deleteConfirmMessage: '',
    }
  },
  computed: {
    isLoading() {
      return this.systemConfigStore.isLoading
    },

    isRegexPattern() {
      return this.spamKeyword.type === 'Regex'
    },

    displayText() {
      return this.spamKeyword.word
    },

    spamKeywordVariant() {
      // Color-code based on type: Literal vs Regex
      switch (this.spamKeyword.type) {
        case 'Regex':
          return 'info'
        case 'Literal':
        default:
          return 'warning'
      }
    },
  },
  methods: {
    confirmDelete() {
      this.deleteConfirmMessage = `Are you sure you want to delete the spam keyword "${this.spamKeyword.word}"? This will affect system-wide message filtering and cannot be undone.`
      this.showDeleteConfirm = true
    },

    async handleDelete() {
      await this.systemConfigStore.deleteSpamKeyword(this.spamKeyword.id)
      this.showDeleteConfirm = false
      this.deleteConfirmMessage = ''
    },
  },
}
</script>