import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { nextTick } from 'vue'
import api from '~/api'
import { GROUP_REPOSTS, MESSAGE_EXPIRE_TIME } from '~/constants'
import { useGroupStore } from '~/stores/group'
import { APIError } from '~/api/BaseAPI'
import { useAuthStore } from '~/stores/auth'
import { useIsochroneStore } from '~/stores/isochrone'

// Debounce delay for batching message fetches (ms)
const BATCH_DELAY = 50

export const useMessageStore = defineStore({
  id: 'message',
  state: () => ({
    list: {},
    byUserList: {},

    // Count of unseen items
    count: 0,

    // In bounds
    bounds: {},
    activePostsCounter: 0,
  }),
  actions: {
    init(config) {
      this.config = config
      // Messages we're in the process of fetching
      this.fetching = {}
      this.fetchingCount = 0
      this.fetchingMyGroups = null
      // Debounced batching state
      this.pendingFetches = []
      this.batchTimer = null
    },
    async fetchCount(browseView, log = true) {
      const ret = await api(this.config).message.count(browseView, log)
      this.count = ret?.count || 0
      return this.count
    },
    async fetch(id, force) {
      id = parseInt(id)

      // Refetch after 10 minutes in case the state has changed.
      const now = Math.round(Date.now() / 1000)
      const expired = this.list[id]?.addedToCache
        ? now - this.list[id].addedToCache > 600
        : false

      // If already cached and not forcing/expired, return immediately
      if (!force && this.list[id] && !expired) {
        return this.list[id]
      }

      // If already fetching this ID, wait for the existing fetch
      if (this.fetching[id]) {
        try {
          await this.fetching[id]
          await nextTick()
        } catch (e) {
          this.handleFetchError(id, e)
        }
        return this.list[id]
      }

      // Add to pending batch and wait for the batch to complete
      return new Promise((resolve, reject) => {
        this.pendingFetches.push({ id, resolve, reject, force })

        // Clear existing timer and set a new one
        if (this.batchTimer) {
          clearTimeout(this.batchTimer)
        }

        this.batchTimer = setTimeout(() => {
          this.processMessageBatch()
        }, BATCH_DELAY)
      })
    },
    handleFetchError(id, e) {
      console.log('Failed to fetch message', e)
      if (e instanceof APIError && e.response.status === 404) {
        console.log('Message deleted, removing from store')
        delete this.list[id]

        const authStore = useAuthStore()
        const userUid = authStore.user?.id
        if (userUid && this.byUserList[userUid]) {
          this.byUserList[userUid] = this.byUserList[userUid].filter(
            (message) => message.id !== id
          )
        }
      } else {
        throw e
      }
    },
    async processMessageBatch() {
      if (!this.pendingFetches.length) {
        return
      }

      // Collect all pending fetches
      const pending = [...this.pendingFetches]
      this.pendingFetches = []
      this.batchTimer = null

      // Filter out IDs that are already cached (unless force/expired)
      const idsToFetch = []
      const now = Math.round(Date.now() / 1000)

      for (const { id, force } of pending) {
        const expired = this.list[id]?.addedToCache
          ? now - this.list[id].addedToCache > 600
          : false

        if ((force || !this.list[id] || expired) && !this.fetching[id]) {
          if (!idsToFetch.includes(id)) {
            idsToFetch.push(id)
          }
        }
      }

      if (idsToFetch.length > 0) {
        try {
          await this.fetchMultiple(idsToFetch)
        } catch (e) {
          // Errors are handled per-message in fetchMultiple
          console.log('Batch fetch error', e)
        }
      }

      // Resolve all promises with the cached data
      for (const { id, resolve } of pending) {
        resolve(this.list[id])
      }
    },
    async fetchMultiple(ids, force) {
      const left = []

      ids.forEach((id) => {
        id = parseInt(id)

        if ((force || !this.list[id]) && !this.fetching[id]) {
          left.push(id)
        }
      })

      if (left.length) {
        // Split into chunks of 19 (API limit is < 20)
        const BATCH_SIZE = 19
        const chunks = []
        for (let i = 0; i < left.length; i += BATCH_SIZE) {
          chunks.push(left.slice(i, i + BATCH_SIZE))
        }

        // Process each chunk
        for (const chunk of chunks) {
          this.fetchingCount++

          // Create a shared promise for the batch fetch. Individual fetch() calls
          // will await this promise instead of making duplicate API requests.
          const batchPromise = api(this.config).message.fetch(
            chunk.join(','),
            false
          )

          // Set the fetching flag for each ID to the shared batch promise.
          chunk.forEach((id) => {
            this.fetching[id] = batchPromise
          })

          try {
            const msgs = await batchPromise

            if (msgs && msgs.forEach) {
              msgs.forEach((msg) => {
                this.list[msg.id] = msg
                if (this.list[msg.id]) {
                  this.list[msg.id].addedToCache = Math.round(Date.now() / 1000)
                }
              })
            } else if (typeof msgs === 'object') {
              this.list[msgs.id] = msgs
              if (this.list[msgs.id]) {
                this.list[msgs.id].addedToCache = Math.round(Date.now() / 1000)
              }
            } else {
              console.error('Failed to fetch', msgs)
            }
          } catch (e) {
            console.log('Failed to fetch messages', e)
            if (e instanceof APIError && e.response.status === 404) {
              console.log('Ignore 404 error')
            } else {
              throw e
            }
          } finally {
            this.fetchingCount--
            // Clear the fetching flags for all IDs in this batch.
            chunk.forEach((id) => {
              this.fetching[id] = null
            })
          }
        }
      }
    },
    async fetchInBounds(swlat, swlng, nelat, nelng, groupid, limit, cache) {
      let ret = []
      const key =
        swlat + ':' + swlng + ':' + nelat + ':' + nelng + ':' + groupid

      if (cache && this.bounds[key]) {
        ret = this.bounds[key]
      } else {
        // Don't cache this, as it might change.
        ret = await api(this.config).message.inbounds(
          swlat,
          swlng,
          nelat,
          nelng,
          groupid,
          limit
        )

        this.bounds[key] = ret
      }

      return ret
    },
    async search(params) {
      await this.clear()
      const ret = await api(this.config).message.search(params)
      return ret
    },
    async fetchMyGroups(gid) {
      let ret = null

      if (this.fetchingMyGroups) {
        ret = await this.fetchingMyGroups
        await nextTick()
      } else {
        this.fetchingMyGroups = api(this.config).message.mygroups(gid)
        ret = await this.fetchingMyGroups
        this.fetchingMyGroups = null
      }
      return ret
    },
    async hasExpired(message) {
      // Consider whether the message has expired.  It's lighter load on the server to do this here rather than
      // when querying.
      let expired = false

      const groupStore = useGroupStore()
      const group = await groupStore.fetch(message.groupid)

      const daysago = dayjs().diff(dayjs(message.arrival), 'day')
      const maxagetoshow = group?.settings?.maxagetoshow
        ? group.settings.maxagetoshow
        : MESSAGE_EXPIRE_TIME
      const reposts = group?.settings?.reposts
        ? group.settings.reposts
        : GROUP_REPOSTS
      const repost = message.type === 'Offer' ? reposts.offer : reposts.wanted
      const maxreposts = repost * (reposts.max + 1)
      const expiretime = Math.max(maxreposts, maxagetoshow)
      expired = daysago > expiretime

      return expired
    },
    async fetchByUser(userid, active, force) {
      let messages = []

      const promise = api(this.config).message.fetchByUser(userid, active)

      // If we're getting non-active messages make sure we hit the server as the cache might be of active only.
      if (!active || force || !this.byUserList[userid]) {
        messages = await promise
        for (const message of messages) {
          if (!message.hasoutcome) {
            const expired = await this.hasExpired(message)

            if (expired) {
              message.hasoutcome = true
            }
          }
        }
        this.byUserList[userid] = messages
      } else if (this.byUserList[userid]) {
        // Fetch but don't wait
        promise.then(async (msgs) => {
          for (const message of msgs) {
            if (!message.hasoutcome) {
              const expired = await this.hasExpired(message)

              if (expired) {
                message.hasoutcome = true
              }
            }
          }
          this.byUserList[userid] = msgs
        })

        messages = this.byUserList[userid]
      }

      return messages || []
    },
    async view(id) {
      await api(this.config).message.view(id)
    },
    async update(params) {
      const authStore = useAuthStore()
      const userUid = authStore.user?.id
      const data = await api(this.config).message.update(params)

      if (data.deleted) {
        // This can happen if we withdraw a post while it is pending.
        delete this.list[params.id]
        if (userUid && this.byUserList[userUid]) {
          this.byUserList[userUid] = this.byUserList[userUid].filter(
            (message) => message.id !== params.id
          )
        }
      } else {
        // Fetch back the updated version.
        const message = await this.fetch(params.id, true)
        this.list[params.id] = message
        if (userUid && this.byUserList[userUid]) {
          const index = this.byUserList[userUid].findIndex(
            (curMessage) => curMessage.id === params.id
          )
          if (index !== -1) {
            this.byUserList[userUid][index] = message

            // If this was an Outcome action, set hasoutcome flag so the post
            // moves from active to old posts list immediately
            if (params.action === 'Outcome') {
              this.byUserList[userUid][index].hasoutcome = true
            }
          }
        }
      }

      return data
    },
    async patch(params) {
      const data = await api(this.config).message.save(params)

      // Clear from store to ensure no attachments.
      this.remove({
        id: params.id,
      })

      await this.fetch(params.id, true)

      return data
    },
    remove(item) {
      delete this.list[parseInt(item.id)]
    },
    clear() {
      this.$reset()
    },
    async promise(id, userid) {
      await api(this.config).message.update({
        id,
        userid,
        action: 'Promise',
      })

      await this.fetch(id, true)
    },
    async renege(id, userid) {
      await api(this.config).message.update({
        id,
        userid,
        action: 'Renege',
      })

      await this.fetch(id, true)
    },
    async addBy(id, userid, count) {
      await api(this.config).message.addBy(id, userid, count)
      await this.fetch(id, true)
    },
    async removeBy(id, userid) {
      await api(this.config).message.removeBy(id, userid)
      await this.fetch(id, true)
    },
    async intend(id, outcome) {
      await api(this.config).message.intend(id, outcome)
    },
    async fetchActivePostCount() {
      const authStore = useAuthStore()
      const userUid = authStore.user?.id

      const activeMessages = await api(this.config).message.fetchByUser(
        userUid,
        true
      )
      this.activePostsCounter = Array.isArray(activeMessages)
        ? activeMessages.length
        : 0
    },
    async markSeen(ids) {
      await api(this.config).message.markSeen(ids)

      const isochroneStore = useIsochroneStore()
      isochroneStore.markSeen(ids)

      await this.fetchCount()
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
    inBounds: (state) => (swlat, swlng, nelat, nelng, groupid) => {
      const key =
        swlat + ':' + swlng + ':' + nelat + ':' + nelng + ':' + groupid

      return key in this.bounds ? this.bounds[key] : []
    },
    all: (state) => Object.values(state.list),
    byUser: (state) => (userid) => {
      return state.byUserList[userid] || []
    },
  },
})
