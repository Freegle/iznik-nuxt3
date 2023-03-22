import { defineStore } from 'pinia'
import api from '~/api'

export const useStatsStore = defineStore({
  id: 'stats',
  state: () => ({
    fetching: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(params) {
      const stats = await api(this.config).dashboard.fetch(params)

      for (const type in stats) {
        this[type] = stats[type]
      }
    },
    clear() {
      this.$reset()
    },
  },
})
