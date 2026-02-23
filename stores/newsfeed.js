import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import api from '~/api'

export const useNewsfeedStore = defineStore({
  id: 'newsfeed',
  state: () => ({
    // This is a barebones list of items in order.
    feed: [],

    // This is the list of full items we've fetched.
    list: {},

    // Max seen
    maxSeen: 0,

    // Count of interesting items
    count: 0,

    // Most recently used distance.
    lastDistance: 0,

    // Track what was seen before visiting ChitChat page (for "you're up to date" divider).
    seenBeforeVisit: null,

    // Whether we're in delayed seen mode (don't auto-mark as seen).
    delayedSeenMode: false,

    // Timer ID for delayed seen marking.
    delayedSeenTimer: null,
  }),
  actions: {
    init(config) {
      this.config = config
      this.maxSeen = 0
      this.fetching = {}
    },
    reset() {
      const init = this.config
      this.$reset()
      this.config = init
    },
    async fetchCount(distance, log = true) {
      this.lastDistance = distance
      distance = distance || 'anywhere'
      const ret = await api(this.config).news.count(distance, log)
      this.count = ret?.count || 0
      return this.count
    },
    addItems(items) {
      const prevMax = this.maxSeen

      items.forEach((item) => {
        if (item.id > this.maxSeen) {
          this.maxSeen = item.id
        }

        this.list[item.id] = item

        if (item.replies?.length) {
          item.replies.forEach((reply) => {
            if (typeof reply === 'object') {
              this.addItems([reply])
            }
          })
        }
      })

      // Now that they are in store convert all the replies into just ids.  This avoids some reactivity issues.
      items.forEach((item) => {
        if (item.replies?.length) {
          item.replies = item.replies.map((reply) => {
            if (typeof reply === 'object') {
              return reply.id
            } else return reply
          })
        } else {
          item.replies = []
        }
      })

      // Only auto-mark as seen if not in delayed mode.
      if (this.maxSeen > prevMax && !this.delayedSeenMode) {
        api(this.config)
          .news.seen(this.maxSeen)
          .then(() => {
            this.fetchCount(this.lastDistance, false)
          })
      }
    },
    snapshotSeenBeforeVisit() {
      // Capture what was seen before visiting the page.
      // This is used to show the "you're up to date" divider.
      this.seenBeforeVisit = this.maxSeen
      this.delayedSeenMode = true
    },
    startDelayedSeen(delayMs = 30000) {
      // Start a timer to mark items as seen after delay.
      if (this.delayedSeenTimer) {
        clearTimeout(this.delayedSeenTimer)
      }

      this.delayedSeenTimer = setTimeout(() => {
        this.markAllSeen()
      }, delayMs)
    },
    markAllSeen() {
      // Mark all items as seen and update the count.
      if (this.delayedSeenTimer) {
        clearTimeout(this.delayedSeenTimer)
        this.delayedSeenTimer = null
      }

      this.delayedSeenMode = false

      if (this.maxSeen > 0) {
        api(this.config)
          .news.seen(this.maxSeen)
          .then(() => {
            this.fetchCount(this.lastDistance, false)
          })
      }
    },
    cancelDelayedSeen() {
      // Cancel the delayed seen timer (e.g., when leaving the page).
      if (this.delayedSeenTimer) {
        clearTimeout(this.delayedSeenTimer)
        this.delayedSeenTimer = null
      }

      this.delayedSeenMode = false
      this.seenBeforeVisit = null
    },
    async fetchFeed(distance) {
      this.lastDistance = distance
      distance = distance || 'anywhere'
      this.feed = await api(this.config).news.fetch(null, distance)
      return this.feed
    },
    async fetch(id, force, lovelist) {
      try {
        if (!this.list[id] || force) {
          if (!this.fetching[id]) {
            this.fetching[id] = api(this.config).news.fetch(
              id,
              null,
              lovelist,
              false
            )
          }

          const ret = await this.fetching[id]
          await nextTick()
          this.fetching[id] = null

          if (ret?.id) {
            this.list[id] = ret

            this.addItems([ret])
          }
        } else if (this.list[id]) {
          // We have it in the store, but we should kick off a fetch anyway to update it.
          if (!this.fetching[id]) {
            this.fetching[id] = api(this.config)
              .news.fetch(id, null, lovelist, false)
              .then((ret) => {
                this.fetching[id] = null
                if (ret?.id) {
                  this.list[id] = ret

                  this.addItems([ret])
                }
              })
          }
        }
      } catch (e) {
        console.log('Fetch of newsfeed failed', id, e)
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

      if (!threadhead) {
        await this.fetchFeed()
      } else {
        await this.fetch(threadhead, true)
      }

      return id
    },
    async edit(id, message, threadhead) {
      await api(this.config).news.edit(id, message)
      await this.fetch(threadhead, true)
    },
    async delete(id, threadhead) {
      await api(this.config).news.del(id)

      if (id !== threadhead) {
        await this.fetch(threadhead, true)
      } else {
        delete this.list[id]
        this.feed = this.feed.filter((item) => item.id !== id)
      }
    },
    async unfollow(id) {
      await api(this.config).news.unfollow(id)
    },
    async unhide(id) {
      await api(this.config).news.unhide(id)
      await this.fetch(id, true)
    },
    async hide(id) {
      await api(this.config).news.hide(id)
      await this.fetch(id, true)
    },
    async convertToStory(id) {
      await api(this.config).news.convertToStory(id)
    },
    async referTo(id, type) {
      await api(this.config).news.referto(id, type)
      await this.fetch(id, true)
    },
    async report(id, reason) {
      await api(this.config).news.report(id, reason)
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
    tagusers(state) {
      let ret = []
      const userids = {}

      for (const id in state.list) {
        const item = state.list[id]

        if (item?.userid && item?.displayname) {
          if (!userids[item.userid]) {
            userids[item.userid] = true
            ret.push({
              id: item.userid,
              displayname: item.displayname,
            })
          }
        }

        if (item?.replies?.length) {
          for (const reply of item.replies) {
            if (reply.userid && reply.displayname) {
              if (!userids[reply.userid]) {
                userids[reply.userid] = true
                ret.push({
                  id: reply.userid,
                  displayname: reply.displayname,
                })
              }
            }
          }
        }
      }

      ret = ret.sort((a, b) => {
        return a.displayname
          .toLowerCase()
          .localeCompare(b.displayname.toLowerCase())
      })

      return ret
    },
  },
})
