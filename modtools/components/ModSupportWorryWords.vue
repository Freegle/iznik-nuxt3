<template>
  <div>
    <NoticeMessage variant="danger" class="mb-3">
      Use with extreme care. Worry words automatically flag messages for
      moderation. Changes here affect the entire system and all communities.
    </NoticeMessage>

    <div v-if="systemConfigStore.isLoading" class="text-center">
      <b-spinner class="mr-2" />
      Loading worry words...
    </div>

    <div v-else>
      <b-form class="mb-3" @submit.prevent="addWorryWord">
        <b-form-group label="Add new worry word:" label-for="new-worry-word">
          <b-form-select
            v-model="patternType"
            :options="patternTypeOptions"
            class="mb-2"
          />

          <b-form-select
            v-model="worryWordType"
            :options="worryWordTypeOptions"
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
              id="new-worry-word"
              v-model="newWorryWord"
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
                  !newWorryWord ||
                  !newWorryWord.trim() ||
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
        v-if="systemConfigStore.getWorrywords.length === 0"
        class="text-muted"
      >
        No worry words configured.
      </div>

      <div v-else>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">
            Current worry words ({{ filteredWorrywords.length }} of
            {{ systemConfigStore.getWorrywords.length }}):
          </h5>
          <b-form-select
            v-model="worrywordTypeFilter"
            :options="worrywordTypeOptions"
            size="sm"
            style="width: 200px"
          />
        </div>
        <div class="d-flex flex-wrap">
          <ModWorryWordBadge
            v-for="worryword in filteredWorrywords"
            :key="worryword.id"
            :worryword="worryword"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { useSystemConfigStore } from '~/stores/systemconfig'

export default {
  name: 'ModSupportWorryWords',
  setup() {
    const systemConfigStore = useSystemConfigStore()
    return { systemConfigStore }
  },
  data() {
    return {
      newWorryWord: '',
      patternType: 'literal',
      worryWordType: 'Review',
      patternTypeOptions: [
        { text: 'Literal (exact word/phrase)', value: 'literal' },
        { text: 'Regular Expression (advanced)', value: 'regex' },
      ],
      regexError: '',
      worrywordTypeFilter: 'all',
      worryWordTypeOptions: [
        { text: 'Review', value: 'Review' },
        { text: 'Regulated', value: 'Regulated' },
        { text: 'Reportable', value: 'Reportable' },
        { text: 'Medicine', value: 'Medicine' },
        { text: 'Allowed', value: 'Allowed' },
      ],
      worrywordTypeOptions: [
        { text: 'All Types', value: 'all' },
        { text: 'Review', value: 'Review' },
        { text: 'Regulated', value: 'Regulated' },
        { text: 'Reportable', value: 'Reportable' },
        { text: 'Medicine', value: 'Medicine' },
        { text: 'Allowed', value: 'Allowed' },
      ],
    }
  },
  computed: {
    regexValidationState() {
      if (this.patternType !== 'regex' || !this.newWorryWord.trim()) {
        return null
      }

      try {
        // eslint-disable-next-line no-new
        new RegExp(this.newWorryWord.trim())
        return true
      } catch (e) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.regexError = `Invalid regex: ${e.message}`
        return false
      }
    },

    filteredWorrywords() {
      if (this.worrywordTypeFilter === 'all') {
        return this.systemConfigStore.getWorrywords
      }
      return this.systemConfigStore.getWorrywords.filter(
        (worryword) => worryword.type === this.worrywordTypeFilter
      )
    },
  },
  methods: {
    async fetchWorryWords() {
      // Fetch worry words when tab is selected
      await this.systemConfigStore.fetchWorrywords()
    },

    async addWorryWord() {
      if (!this.newWorryWord || !this.newWorryWord.trim()) return

      const trimmedWord = this.newWorryWord.trim()

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

      // Add pattern type prefix to distinguish regex from literal
      const patternToAdd =
        this.patternType === 'regex' ? `REGEX:${trimmedWord}` : trimmedWord

      // Use the selected type from the form
      const type = this.worryWordType

      await this.systemConfigStore.addWorryword(patternToAdd, type)
      this.newWorryWord = ''
    },
  },
}
</script>
