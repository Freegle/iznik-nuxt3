import { defineStore } from 'pinia'
import api from '~/api'

export const useTrystStore = defineStore({
  id: 'tryst',
  state: () => ({
    config: null,
    WKT: null,
    L: null,
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
        this.fetching = api(this.config).tryst.fetch()
        const { trysts } = await this.fetching
        this.fetching = null
        this.list = trysts
      }
    },
    async add(user1, user2, arrangedfor) {
      const id = await api(this.config).tryst.add({
        user1,
        user2,
        arrangedfor,
      })

      if (id) {
        await this.fetch()
      }

      return id
    },
    async edit(id, arrangedfor) {
      await api(this.config).tryst.edit({
        id,
        arrangedfor,
      })

      await this.fetch()
    },
    async delete(id) {
      await api(this.config).tryst.delete({
        id,
      })
      await this.fetch()
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
