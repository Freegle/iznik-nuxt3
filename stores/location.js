import { defineStore } from 'pinia'
import api from '~/api'

export const useLocationStore = defineStore({
  id: 'location',
  state: () => ({}),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(params) {
      return await api(this.config).location.fetch(params)
    },
  },
})
