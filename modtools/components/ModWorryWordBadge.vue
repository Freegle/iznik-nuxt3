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

<script>
import { useSystemConfigStore } from '../stores/systemconfig'

export default {
  name: 'ModWorryWordBadge',
  props: {
    worryword: {
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
      return this.worryword.keyword.startsWith('REGEX:')
    },

    displayText() {
      return this.isRegexPattern
        ? this.worryword.keyword.substring(6)
        : this.worryword.keyword
    },

    worrywordVariant() {
      // Color-code based on type first, then consider regex
      const isRegex = this.isRegexPattern

      switch (this.worryword.type) {
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
    },
  },
  methods: {
    confirmDelete() {
      this.deleteConfirmMessage = `Are you sure you want to delete the worry word "${this.worryword.keyword}"? This will affect system-wide message filtering and cannot be undone.`
      this.showDeleteConfirm = true
    },

    async handleDelete() {
      await this.systemConfigStore.deleteWorryword(this.worryword.id)
      this.showDeleteConfirm = false
      this.deleteConfirmMessage = ''
    },
  },
}
</script>
