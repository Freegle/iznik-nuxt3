import { defineStore } from 'pinia'
import api from '~/api'

export const useNewsfeedStore = defineStore({
  id: 'newsfeed',
  state: () => ({
    config: null,
    feed: [],
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id) {
      if (!id) {
        this.feed = await api(this.config).news.fetch()
        console.log('Fetched feed', this.list)
        return this.feed
      } else {
        this.list[id] = await api(this.config).news.fetch(id)
        return this.list[id]
      }
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
