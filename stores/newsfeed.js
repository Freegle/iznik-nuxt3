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
    addItems(items) {
      items.forEach((item) => {
        this.list[item.id] = item

        if (item.replies?.length) {
          this.addItems(item.replies)
        }
      })
    },
    async fetch(id, distance) {
      if (!id) {
        // Get the feed.
        this.feed = await api(this.config).news.fetch(null, distance)
        return this.feed
      } else {
        // Get a single item.
        const ret = await api(this.config).news.fetch(id)

        if (ret?.id) {
          this.list[id] = ret

          this.addItems([ret])
        }

        return this.list[id]
      }
    },
    async love(id, threadhead) {
      await api(this.config).news.love(id)
      await this.fetch(threadhead)
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
