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
        this.fetching = null
      }
    },
    async delete(id) {
      await api(this.config).address.del(id)

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
    async update(params) {
      await api(this.config).address.update(params)
    },
    async add(params) {
      const { id } = await api(this.config).address.add(params)
      await this.fetch()
      return id
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
