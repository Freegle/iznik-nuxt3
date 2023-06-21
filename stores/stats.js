import { defineStore } from 'pinia'
import api from '~/api'

export const useStatsStore = defineStore({
  id: 'stats',
  state: () => ({
    heatmap: {},
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
    async fetchHeatmap() {
      this.heatmap = await api(this.config).dashboard.fetchHeatmap()
      return this.heatmap
    },
    clear() {
      this.$reset()
    },
  },
})
