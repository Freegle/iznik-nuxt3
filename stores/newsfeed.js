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

    // These are the ones we are currently fetching.
    fetching: {},

    // Count of interesting items
    count: 0,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetchCount() {
      const ret = await api(this.config).news.count()
      this.count = ret?.count
      return this.count
    },
    addItems(items) {
      items.forEach((item) => {
        this.list[item.id] = item

        if (item.replies?.length) {
          this.addItems(item.replies)
        }
      })
    },
    async fetchFeed(distance) {
      this.feed = await api(this.config).news.fetch(null, distance)

      // Update the max seen
      let max = null

      for (const item of this.feed) {
        max = Math.max(max, item.id)
      }

      if (max) {
        api(this.config).news.seen(max)
      }

      return this.feed
    },
    async fetch(id, force, lovelist) {
      if (!this.list[id] || force) {
        if (!this.fetching[id]) {
          this.fetching[id] = api(this.config).news.fetch(id, null, lovelist)
        }

        const ret = await this.fetching[id]
        this.fetching[id] = null

        if (ret?.id) {
          this.list[id] = ret

          this.addItems([ret])
        }
      }

      return this.list[id]
    },
    async love(id, threadhead) {
      await api(this.config).news.love(id)
      await this.fetch(threadhead, true)
    },
    async unlove(id, threadhead) {
      await api(this.config).news.unlove(id)
      await this.fetch(threadhead, true)
    },
    async send(message, replyto, threadhead, imageid) {
      if (message) {
        // Removing the enter on the end can prevent some duplicates.
        message = message.trim()
      }

      const id = await api(this.config).news.send({
        message,
        replyto,
        threadhead,
        imageid,
      })

      await this.fetch(threadhead || id, true)

      return id
    },
    async edit(id, message, threadhead) {
      await api(this.config).news.edit(id, message)
      await this.fetch(threadhead, true)
    },
    async delete(id, threadhead) {
      await api(this.config).news.del(id)

      if (id !== threadhead) {
        await this.fetch(threadhead)
      } else {
        this.list[id] = null
        this.feed = this.feed.filter((item) => item.id !== id)
      }
    },
    async unfollow(id) {
      await api(this.config).news.unfollow(id)
    },
    async unhide(id) {
      await api(this.config).news.unhide(id)
      await this.fetch(id)
    },
    async referto(id, type) {
      await api(this.config).news.referto(id, type)
      await this.fetch(id)
    },
    async report(id, reason) {
      await api(this.config).news.report(id, reason)
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
