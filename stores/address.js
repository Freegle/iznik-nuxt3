import { defineStore } from 'pinia'
import api from '~/api'

export const useAddressStore = defineStore({
  id: 'address',
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
      this.list = await api(this.config).address.fetchv2()
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
