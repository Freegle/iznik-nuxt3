import { defineStore } from 'pinia'
import api from '~/api'

export const useAuthorityStore = defineStore({
  id: 'authority',
  state: () => ({
    list: [],
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id) {
      const ret = await api(this.config).authority.fetch({
        id,
      })

      this.list[id] = ret?.authority

      return this.list[id]
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
  },
})
