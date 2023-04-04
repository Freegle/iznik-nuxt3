import { defineStore } from 'pinia'
import api from '~/api'

export const useLogoStore = defineStore({
  id: 'logo',
  state: () => ({}),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(params) {
      return await api(this.config).logo.fetch(params)
    },
  },
})
