import { defineStore } from 'pinia'
import api from '~/api'

export const useLocationStore = defineStore({
  id: 'location',
  state: () => ({
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(params) {
      return await api(this.config).location.fetch(params)
    },
    async fetchv2(id) {
      const loc = await api(this.config).location.fetchv2(id)

      if (loc) {
        this.list[loc.id] = loc
      }

      return loc
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
