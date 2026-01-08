import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import api from '~/api'

// Debounce delay for batching user fetches (ms)
const BATCH_DELAY = 50

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    list: {},
    locationList: {},
  }),
  actions: {
    init(config) {
      this.config = config
      this.fetching = {}
      this.fetchingLocation = {}
      this.pendingFetches = []
      this.batchTimer = null
      this.batchPromise = null
    },
    clear() {
      // ModTools
      console.log('uUS clear')
      this.list = {}
      this.locationList = {}
      this.fetching = {}
      this.fetchingLocation = {}
    },
    async emailIsInUse(email) {
      const ret = await api(this.config).user.fetchByEmail(email, false)
      return ret?.exists
    },
    async fetchMT(params) {
      // id, info, search, emailhistory
      params.info = true
      const { user, users } = await api(this.config).user.fetchMT(params)
      if (user) {
        this.list[user.id] = user
        return user
      }
      if (users) {
        for (const user of users) {
          this.list[user.id] = user
        }
        return users
      }
    },
    async fetch(id, force) {
      id = parseInt(id)
      if (isNaN(id)) {
        console.log('USEUSERSTORE FETCH ID NULL')
        console.trace()
        return
      }

      // If already cached and not forcing, return immediately
      if (!force && this.list[id]) {
        return this.list[id]
      }

      // If already fetching this ID, wait for the existing fetch
      if (this.fetching[id]) {
        await this.fetching[id]
        await nextTick()
        // If not forcing, return the result now
        if (!force) {
          return this.list[id]
        }
        // Otherwise, continue to queue a force refresh
      }

      // Add to pending batch and wait for the batch to complete
      return new Promise((resolve) => {
        this.pendingFetches.push({ id, resolve, force })

        // Clear existing timer and set a new one
        if (this.batchTimer) {
          clearTimeout(this.batchTimer)
        }

        this.batchTimer = setTimeout(() => {
          this.processBatch()
        }, BATCH_DELAY)
      })
    },
    async processBatch() {
      if (!this.pendingFetches.length) {
        return
      }

      // Collect all pending fetches
      const pending = [...this.pendingFetches]
      this.pendingFetches = []
      this.batchTimer = null

      // Filter out IDs that are already cached (unless force)
      const idsToFetch = []
      const resolvers = {}

      for (const { id, resolve, force } of pending) {
        if (!resolvers[id]) {
          resolvers[id] = []
        }
        resolvers[id].push(resolve)

        if ((force || !this.list[id]) && !this.fetching[id]) {
          if (!idsToFetch.includes(id)) {
            idsToFetch.push(id)
          }
        }
      }

      if (idsToFetch.length > 0) {
        await this.fetchMultiple(idsToFetch)
      }

      // Resolve all promises with the cached data
      for (const { id, resolve } of pending) {
        resolve(this.list[id])
      }
    },
    async fetchMultiple(ids) {
      // Filter out IDs that are already being fetched
      const left = ids
        .map((id) => parseInt(id))
        .filter((id) => !this.fetching[id])

      if (left.length) {
        // Split into chunks of 20 (API limit)
        const BATCH_SIZE = 20
        const chunks = []
        for (let i = 0; i < left.length; i += BATCH_SIZE) {
          chunks.push(left.slice(i, i + BATCH_SIZE))
        }

        // Process each chunk
        for (const chunk of chunks) {
          // Create a shared promise for the batch request
          const batchPromise = api(this.config).user.fetchMultiple(chunk)

          // Set the same promise for each ID so concurrent fetches wait for the same request
          chunk.forEach((id) => {
            this.fetching[id] = batchPromise
          })

          try {
            const users = await batchPromise

            // Handle both array response (multiple users) and single user response
            if (Array.isArray(users)) {
              users.forEach((user) => {
                if (user) {
                  this.list[user.id] = user
                }
              })
            } else if (users) {
              this.list[users.id] = users
            }
          } finally {
            // Clear fetching flags
            chunk.forEach((id) => {
              this.fetching[id] = null
            })
          }
        }
      }
    },
    async fetchPublicLocation(id, force) {
      id = parseInt(id)

      if (force || !this.locationList[id]) {
        if (this.fetchingLocation[id]) {
          await this.fetchingLocation[id]
          await nextTick()
        } else {
          this.fetchingLocation[id] = api(this.config).user.fetchPublicLocation(
            id
          )
          const location = await this.fetchingLocation[id]

          if (location) {
            this.locationList[id] = location
          }

          this.fetchingLocation[id] = null
        }
      }

      return this.locationList[id]
    },
    async rate(id, rating, reason, text) {
      await api(this.config).user.rate(id, rating, reason, text)
      // Directly fetch the user to ensure UI updates immediately.
      // Don't use the batched fetch which can have race conditions.
      const user = await api(this.config).user.fetch(id)
      if (user) {
        this.list[id] = user
      }
    },
    async engaged(engageid) {
      await api(this.config).user.engaged(engageid)
    },
    async muteOnChitChat(userid) {
      await api(this.config).user.muteOnChitChat(userid)
    },
    async unMuteOnChitChat(userid) {
      await api(this.config).user.unMuteOnChitChat(userid)
    },
    async deleteComment(id) {
      await api(this.config).comment.del(id)
    },
    async saveComment(comment) {
      await api(this.config).comment.save(comment)
    },
    async edit(params) {
      await api(this.config).user.save(params)
    },
    async addEmail(params) {
      await api(this.config).user.addEmail(
        params.id,
        params.email,
        params.primary
      )
      await this.fetch(params.id, true)
    },
    async add(params) {
      const ret = await api(this.config).user.add(params.email)
      return ret.id
    },
    async purge(id) {
      await api(this.config).user.purge(id)
    },
    async ratingReviewed(params) {
      await api(this.config).user.ratingReviewed(params.id)
    },
  },
  getters: {
    byId: (state) => {
      return (id) => {
        if (!id) return null
        const user = state.list[id]
        if (user && user.spammer && user.spammer.collection === 'Whitelisted')
          user.spammer = false
        return user
      }
    },
    publicLocationById: (state) => {
      return (id) => state.locationList[id]
    },
  },
})
