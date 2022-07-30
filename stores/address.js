import { defineStore } from 'pinia'
import api from '~/api'

export const useAddressStore = defineStore({
  id: 'address',
  state: () => ({
    config: null,
    list: [],
    fetching: null,
    properties: {},
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
    async delete(id) {
      await api(this.config).address.del({
        id,
      })

      await this.fetch()
    },
    async fetchProperties(postcodeid) {
      const { addresses } = await api(this.config).address.fetchv1({
        postcodeid,
      })

      addresses.forEach((address) => {
        this.properties[address.id] = address
      })
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
