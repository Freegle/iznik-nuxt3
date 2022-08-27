import { defineStore } from 'pinia'
import api from '~/api'

export const useNewsfeedStore = defineStore({
  id: 'newsfeed',
  state: () => ({
    config: null,

    // This is a barebones list of items in order.
    feed: [],

    // This is the list of full items we've fetched.
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, distance) {
      if (!id) {
        // Get the feed.
        this.feed = await api(this.config).news.fetch(null, distance)
        console.log('fetched feed')
        return this.feed
      } else {
        // Get a single item.
        this.list[id] = await api(this.config).news.fetch(id)
        console.log('Fetched single', id, this.list[id])
        return this.list[id]
      }
    },
    async love(id, threadhead) {
      await api(this.config).news.love(id)
      console.log('loved', id, threadhead)
      await this.fetch(threadhead)
      console.log('fetched', threadhead)
    },
    async unlove(id, threadhead) {
      await api(this.config).news.unlove(id)
      await this.fetch(threadhead)
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
