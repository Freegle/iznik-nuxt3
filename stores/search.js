import { defineStore } from 'pinia'
import api from '~/api'

export const useSearchStore = defineStore({
  id: 'search',
  state: () => ({
    config: null,
    list: [],
    fetching: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(userid) {
      if (this.fetching) {
        await this.fetching
      } else {
        this.fetching = api(this.config).usersearch.fetch(userid)
        this.list = await this.fetching
        this.fetching = null
      }
    },
    async delete(id, userid) {
      await api(this.config).usersearch.del(id)

      await this.fetch(userid)
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
