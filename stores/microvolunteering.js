import { defineStore } from 'pinia'
import api from '~/api'

export const useMicroVolunteeringStore = defineStore({
  id: 'microvolunteering',
  state: () => ({
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    clearOne(id) {
      delete this.list[id]
    },
    clear() {
      this.$reset()
    },
    async challenge(types) {
      const item = await api(this.config).microvolunteering.challenge(types)

      if (item) {
        this.list[item.id] = item
      }

      return item
    },
    async respond(params) {
      await api(this.config).microvolunteering.response(params)
    },
    async fetch(params) {
      const { context, microvolunteerings } = await api(
        this.config
      ).microvolunteering.fetch(params)

      for (const microvolunteering of microvolunteerings) {
        this.list[microvolunteering.id] = microvolunteering
      }
      return context
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
