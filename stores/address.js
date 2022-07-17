import { defineStore } from 'pinia'
import api from '~/api'

export const useAddressStore = defineStore({
  id: 'address',
  state: () => ({
    config: null,
    list: [],
    fetching: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch() {
      if (this.fetching) {
        await this.fetching
      } else {
        this.fetching = api(this.config).address.fetchv2()
        this.list = await this.fetching
      }
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
