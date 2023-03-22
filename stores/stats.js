import { defineStore } from 'pinia'
import api from '~/api'

export const useStatsStore = defineStore({
  id: 'stats',
  state: () => ({
    Heatmap: null,
    fetching: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(params) {
      const stats = await api(this.config).dashboard.fetch(params)
      console.log('Got stats', stats)

      for (const type in stats) {
        console.log('Copy', type, stats[type])
        this[type] = stats[type]
      }

      console.log('Set', this)
    },
    async fetchHeatmap(params) {
      const ret = await api(this.config).dashboard.fetchHeatmap(params)
      this.Heatmap = ret
    },
    clear() {
      this.$reset()
    },
  },
})
