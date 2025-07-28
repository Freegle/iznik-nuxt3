<template>
  <div>
    <NoticeMessage variant="danger" class="mb-3">
      Use with extreme care. Spam keywords automatically flag messages for
      moderation or deletion. Changes here affect the entire system and all
      communities.
    </NoticeMessage>

    <div v-if="systemConfigStore.isLoading" class="text-center">
      <b-spinner class="mr-2" />
      Loading spam keywords...
    </div>

    <div v-else>
      <b-form class="mb-3" @submit.prevent="addSpamKeyword">
        <b-form-group
          label="Add new spam keyword:"
          label-for="new-spam-keyword"
        >
          <b-form-select
            v-model="patternType"
            :options="patternTypeOptions"
            class="mb-2"
          />

          <b-form-select
            v-model="actionType"
            :options="actionTypeOptions"
            class="mb-2"
          />

          <NoticeMessage
            v-if="patternType === 'regex'"
            variant="warning"
            class="mb-2"
          >
            <strong>Regular Expressions:</strong> Require technical knowledge.
            Test thoroughly before adding. Invalid regex will be rejected.
          </NoticeMessage>

          <b-input-group>
            <b-form-input
              id="new-spam-keyword"
              v-model="newSpamKeyword"
              :placeholder="
                patternType === 'regex'
                  ? 'Enter regex pattern (e.g., \\b(word1|word2)\\b)'
                  : 'Enter word or phrase'
              "
              :disabled="systemConfigStore.isLoading"
              :state="regexValidationState"
            />
            <template #append>
              <b-button
                type="submit"
                variant="primary"
                :disabled="
                  !newSpamKeyword ||
                  !newSpamKeyword.trim() ||
                  systemConfigStore.isLoading ||
                  (patternType === 'regex' && regexValidationState === false)
                "
              >
                Add
              </b-button>
            </template>
          </b-input-group>

          <b-form-invalid-feedback v-if="regexValidationState === false">
            {{ regexError }}
          </b-form-invalid-feedback>
        </b-form-group>
      </b-form>

      <div v-if="systemConfigStore.hasError" class="mb-3">
        <NoticeMessage variant="danger">
          Error: {{ systemConfigStore.getError }}
        </NoticeMessage>
      </div>

      <div
        v-if="systemConfigStore.getSpamKeywords.length === 0"
        class="text-muted"
      >
        No spam keywords configured.
      </div>

      <div v-else>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">
            Current spam keywords ({{ filteredSpamKeywords.length }} of
            {{ systemConfigStore.getSpamKeywords.length }}):
          </h5>
          <b-form-select
            v-model="spamKeywordTypeFilter"
            :options="spamKeywordTypeOptions"
            size="sm"
            style="width: 200px"
          />
        </div>
        <div class="d-flex flex-wrap">
          <ModSpamKeywordBadge
            v-for="spamKeyword in filteredSpamKeywords"
            :key="spamKeyword.id"
            :spam-keyword="spamKeyword"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { useSystemConfigStore } from '../stores/systemconfig'

export default {
  name: 'ModSupportSpamKeywords',
  setup() {
    const systemConfigStore = useSystemConfigStore()
    return { systemConfigStore }
  },
  data() {
    return {
      newSpamKeyword: '',
      patternType: 'literal',
      patternTypeOptions: [
        { text: 'Literal (exact word/phrase)', value: 'literal' },
        { text: 'Regular Expression (advanced)', value: 'regex' },
      ],
      actionType: 'Review',
      actionTypeOptions: [
        { text: 'Review', value: 'Review' },
        { text: 'Spam', value: 'Spam' },
        { text: 'Whitelist', value: 'Whitelist' },
      ],
      regexError: '',
      spamKeywordTypeFilter: 'all',
      spamKeywordTypeOptions: [
        { text: 'All Types', value: 'all' },
        { text: 'Literal', value: 'Literal' },
        { text: 'Regex', value: 'Regex' },
      ],
    }
  },
  computed: {
    regexValidationState() {
      if (this.patternType !== 'regex' || !this.newSpamKeyword.trim()) {
        return null
      }

      try {
        // eslint-disable-next-line no-new
        new RegExp(this.newSpamKeyword.trim())
        return true
      } catch (e) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.regexError = `Invalid regex: ${e.message}`
        return false
      }
    },

    filteredSpamKeywords() {
      if (this.spamKeywordTypeFilter === 'all') {
        return this.systemConfigStore.getSpamKeywords
      }
      return this.systemConfigStore.getSpamKeywords.filter(
        (spamKeyword) => spamKeyword.type === this.spamKeywordTypeFilter
      )
    },
  },
  methods: {
    async fetchSpamKeywords() {
      // Fetch spam keywords when tab is selected
      await this.systemConfigStore.fetchSpamKeywords()
    },

    async addSpamKeyword() {
      if (!this.newSpamKeyword || !this.newSpamKeyword.trim()) return

      const trimmedWord = this.newSpamKeyword.trim()

      // For regex patterns, validate first
      if (this.patternType === 'regex') {
        try {
          // eslint-disable-next-line no-new
          new RegExp(trimmedWord)
        } catch (e) {
          this.regexError = `Invalid regex: ${e.message}`
          return
        }
      }

      // For spam keywords, the type determines if it's Literal or Regex
      const keywordType = this.patternType === 'regex' ? 'Regex' : 'Literal'

      await this.systemConfigStore.addSpamKeyword(
        trimmedWord,
        keywordType,
        this.actionType
      )
      this.newSpamKeyword = ''
    },
  },
}
</script>
