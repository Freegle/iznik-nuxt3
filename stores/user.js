import { defineStore } from 'pinia'
import api from '~/api'

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    config: {},
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async emailIsInUse(params) {
      const ret = await api(this.config).user.fetch(params)
      return ret && ret.id
    },
    async fetch(id, force) {
      id = parseInt(id)

      if (force || !this.list[id]) {
        // TODO Caching
        const user = await api(this.config).user.fetch(id)
        console.log('Fetched ', id, user)

        if (user) {
          this.list[id] = user
        }
      }

      return this.list[id]
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
  },
})
