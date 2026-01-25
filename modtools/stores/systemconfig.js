import { defineStore } from 'pinia'
import api from '~/api'

export const useSystemConfigStore = defineStore({
  id: 'systemconfig',
  state: () => ({
    // System-level configuration items
    worrywords: [],
    spam_keywords: [],

    // For tracking fetch state
    loading: false,
    error: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },

    // Worrywords management
    async fetchWorrywords() {
      this.loading = true
      this.error = null
      try {
        console.log('Fetching worry words from API...', this.config)
        const response = await api(this.config).config.fetchAdminv2(
          'worry_words'
        )
        // Response is an array of objects with id, keyword, substance, type
        this.worrywords = response || []
      } catch (error) {
        this.error = error.message
        this.worrywords = []
      } finally {
        this.loading = false
      }
    },

    async addWorryword(word, type = 'Review') {
      if (!word || !word.trim()) return

      const trimmedWord = word.trim()
      // Check if keyword already exists
      if (this.worrywords.some((w) => w.keyword === trimmedWord)) return

      this.loading = true
      this.error = null
      try {
        await api(this.config).config.addWorrywordv2({
          keyword: trimmedWord,
          type,
          substance: '',
        })

        await this.fetchWorrywords()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async deleteWorryword(id) {
      this.loading = true
      this.error = null
      try {
        console.log('Deleting worry word with ID:', id)
        await api(this.config).config.deleteWorrywordv2(id)
        await this.fetchWorrywords()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Spam keywords management
    async fetchSpamKeywords() {
      this.loading = true
      this.error = null
      try {
        const response = await api(this.config).config.fetchAdminv2(
          'spam_keywords'
        )
        // Response is an array of objects similar to worrywords
        this.spam_keywords = response || []
      } catch (error) {
        this.error = error.message
        this.spam_keywords = []
      } finally {
        this.loading = false
      }
    },

    async addSpamKeyword(word, type = 'Literal', action = 'Review') {
      if (!word || !word.trim()) return

      const trimmedWord = word.trim()
      // Check if word already exists
      if (this.spam_keywords.some((w) => w.word === trimmedWord)) return

      this.loading = true
      this.error = null
      try {
        await api(this.config).config.addSpamKeywordv2({
          word: trimmedWord,
          type,
          exclude: '',
          action,
        })

        await this.fetchSpamKeywords()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async deleteSpamKeyword(id) {
      this.loading = true
      this.error = null
      try {
        await api(this.config).config.deleteSpamKeywordv2(id)
        await this.fetchSpamKeywords()
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Combined fetch for initialization
    async fetchAll() {
      await Promise.all([this.fetchWorrywords(), this.fetchSpamKeywords()])
    },
  },
  getters: {
    getWorrywords: (state) => state.worrywords,
    getSpamKeywords: (state) => state.spam_keywords,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    getError: (state) => state.error,

    // Helper getters for displaying keywords
    getWorrywordKeywords: (state) => state.worrywords.map((w) => w.keyword),
    getSpamKeywordWords: (state) => state.spam_keywords.map((w) => w.word),
  },
})
