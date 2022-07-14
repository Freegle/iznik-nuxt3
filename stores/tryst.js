import { defineStore } from 'pinia'
import api from '~/api'

export const useTrystStore = defineStore({
  id: 'tryst',
  state: () => ({
    config: null,
    WKT: null,
    L: null,
    list: [],
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch() {
      // TODO CACHE
      const { trysts } = await api(this.config).tryst.fetch()
      this.list = trysts
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
    getByUser: (state) => (userid) => {
      return Object.values(state.list).find((i) => {
        return (
          parseInt(i.user1) === parseInt(userid) ||
          parseInt(i.user2) === parseInt(userid)
        )
      })
    },
  },
})
