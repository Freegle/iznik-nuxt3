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
      this.list[id] = null
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
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
