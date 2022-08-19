import { defineStore } from 'pinia'
import api from '~/api'

export const useNewsfeedStore = defineStore({
  id: 'newsfeed',
  state: () => ({
    config: null,
    list: [],
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id) {
      if (!id) {
        this.list = await api(this.config).newsfeed.fetchv2()
        return this.list
      }
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
