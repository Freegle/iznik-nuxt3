import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import api from '~/api'
import { GROUP_REPOSTS, MESSAGE_EXPIRE_TIME } from '~/constants'
import { useGroupStore } from '~/stores/group'

export const useMessageStore = defineStore({
  id: 'message',
  state: () => ({
    config: {},
    list: {},
    byUserList: {},

    // In bounds
    bounds: {},

    // Messages we're in the process of fetching
    fetching: {},
    fetchingCount: 0,
    fetchingMyGroups: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
      id = parseInt(id)

      if (force || !this.list[id]) {
        if (this.fetching[id]) {
          // Already fetching
          await this.fetching[id]
        } else {
          this.fetchingCount++
          this.fetching[id] = api(this.config).message.fetch(id)
          this.fetchingCount--

          const message = await this.fetching[id]
          this.fetching[id] = null

          if (message) {
            this.list[id] = message
          }
        }
      }

      return this.list[id]
    },
    async fetchMultiple(ids, force) {
      const left = []

      ids.forEach((id) => {
        id = parseInt(id)

        if ((force || !this.list[id]) && !this.fetching[id]) {
          // This is a message we need to fetch and aren't currently fetching.
          left.push(id)
        }
      })

      if (left.length) {
        this.fetchingCount++
        const msgs = await api(this.config).message.fetch(left.join(','))

        msgs.forEach((msg) => {
          this.list[msg.id] = msg
        })

        this.fetchingCount--
      }
    },
    async fetchInBounds(swlat, swlng, nelat, nelng, groupid) {
      // Don't cache this, as it might change.
      const ret = await api(this.config).message.inbounds(
        swlat,
        swlng,
        nelat,
        nelng,
        groupid
      )

      const key =
        swlat + ':' + swlng + ':' + nelat + ':' + nelng + ':' + groupid

      this.bounds[key] = ret
      return ret
    },
    async fetchMyGroups() {
      let ret = null

      if (this.fetchingMyGroups) {
        ret = await this.fetchingMyGroups
      } else {
        this.fetchingMyGroups = api(this.config).message.mygroups()
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
      const maxagetoshow = group.settings.maxagetoshow
        ? group.settings.maxagetoshow
        : MESSAGE_EXPIRE_TIME
      const reposts = group.settings.reposts
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

      if (force || !this.byUserList[userid]) {
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

      return messages
    },
    async view(id) {
      await api(this.config).message.view(id)
    },
    async update(params) {
      const data = await api(this.config).message.update(params)

      if (!data.deleted) {
        // Fetch back the updated version.
        await this.fetch(params.id, true)
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
      return Object.values(state.list).filter((msg) => {
        return msg.fromuser === userid
      })
    },
  },
})
