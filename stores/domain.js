import { defineStore } from 'pinia'
import api from '~/api'

export const useDomainStore = defineStore({
  id: 'domain',
  state: () => ({}),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(params) {
      return await api(this.config).domain.fetch(params)
    },
  },
})
