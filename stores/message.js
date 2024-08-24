import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { nextTick } from 'vue'
import api from '~/api'
import { GROUP_REPOSTS, MESSAGE_EXPIRE_TIME } from '~/constants'
import { useGroupStore } from '~/stores/group'
import { APIError } from '~/api/BaseAPI'
import { useAuthStore } from '~/stores/auth'
import cloneDeep from 'lodash.clonedeep'

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
      // The context from the last fetch, used for fetchMore. // ModTools
      this.context = null
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

      if (force || !this.list[id] || expired) {
        if (this.fetching[id]) {
          // Already fetching
          try {
            await this.fetching[id]
            await nextTick()
          } catch (e) {
            console.log('Failed to fetch message', e)
            if (e instanceof APIError && e.response.status === 404) {
              // This can validly happen if a message is deleted under our feet.
              console.log('Ignore 404 error')
            } else {
              throw e
            }
          }
        } else {
          this.fetchingCount++
          this.fetching[id] = api(this.config).message.fetch(id, false)
          this.fetchingCount--

          try {
            this.list[id] = await this.fetching[id]
            //console.log('fetch',id,typeof this.list[id].fromuser)
            this.fetching[id] = null

            if (this.list[id]) {
              this.list[id].addedToCache = Math.round(Date.now() / 1000)
            }
          } catch (e) {
            console.log('Failed to fetch message', e)
            this.fetching[id] = null

            if (e instanceof APIError && e.response.status === 404) {
              // This can validly happen if a message is deleted under our feet.
              console.log('Ignore 404 error')
            } else {
              throw e
            }
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
        try {
          const msgs = await api(this.config).message.fetch(left.join(','))

          if (msgs && msgs.forEach) {
            msgs.forEach((msg) => {
              this.list[msg.id] = msg
            })

            this.fetchingCount--
          } else if (typeof msgs === 'object') {
            this.list[msgs.id] = msgs
            this.fetchingCount--
          } else {
            console.error('Failed to fetch', msgs)
          }
        } catch (e) {
          console.log('Failed to fetch messages', e)
          if (e instanceof APIError && e.response.status === 404) {
            // This can validly happen if a message is deleted under our feet.
            console.log('Ignore 404 error')
          } else {
            throw e
          }
        }
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
          }
        }
      }

      return data
    },
    async patch(params) {
      const data = await api(this.config).message.save(params)

      // Clear from store to ensure no attachments.
      this.remove({ id: params.id })

      //await this.fetch(params.id, true) // Gets message.fromuser as int not object
      // TODO: CHECK OK SOLUTION
      // Force MT refresh 
      const authStore = useAuthStore()
      authStore.work = {}

      return data
    },
    remove(item) {
      delete this.list[parseInt(item.id)]
    },
    clear() {
      this.$reset()
      this.clearContext() // ModTools
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
      await this.fetchCount()
    },
    async delete(params) {
      await api(this.config).message.delete(
        params.id,
        params.groupid,
        params.subject,
        params.stdmsgid,
        params.body
      )

      delete this.list[params.id]
    },
    clearContext() { // Added for ModTools
      this.context = null
    },
    async fetchMessagesMT(params) { // Added for ModTools
      //console.log("===useMessageStore fetchMessages",params)
      // Watch out for the store being cleared under the feet of this fetch. If that happens then we throw away the
      // results.
      // TODO const instance = state.instance

      if (params.context) {
        // Ensure the context is a real object, in case it has been in the store.
        const ctx = cloneDeep(params.context)
        params.context = ctx
      } else if (this.context) {
        params.context = this.context
      }

      const data = await api(this.config).message.fetchMessages(params)
      await this.clear()
      if( !data.messages) return
      const messages = data.messages
      const context = data.context

      if (params.collection !== 'Draft') {
        // We don't use context for drafts - there aren't many.
        this.context = context
      }
      for (const message of messages) {
        //console.log('GOT message',message.id, typeof message.fromuser)
        this.list[message.id] = message
      }
    },
    async fetchMT(params) { // Added for ModTools
      const { message } = await api(this.config).message.fetchMT(params)
      return message
    },
    async backToPending(id){
      await api(this.config).message.update({
        id,
        action: 'BackToPending'
      })
      this.remove({ id })
    },
    async approve(params) {
      await api(this.config).message.approve(
        params.id,
        params.groupid,
        params.subject,
        params.stdmsgid,
        params.body
      )

      this.remove({ id: params.id })

      const authStore = useAuthStore()
      authStore.work = {}
    },
    async reject(params) {
      await api(this.config).message.reject(
        params.id,
        params.groupid,
        params.subject,
        params.stdmsgid,
        params.body
      )

      this.remove({ id: params.id })

      const authStore = useAuthStore()
      authStore.work = {}
    },
    async reply(params) {
      await api(this.config).message.reply(
        params.id,
        params.groupid,
        params.subject,
        params.stdmsgid,
        params.body
      )

      this.remove({ id: params.id })

      const authStore = useAuthStore()
      authStore.work = {}
    },
    async hold(params) {
      await api(this.config).message.hold(params.id)
      const { message } = await api(this.config).message.fetchMT({
        id: params.id,
        messagehistory: true
      })
      this.list[message.id] = message
    },
    async release(params) {
      await api(this.config).message.release(params.id)
      const { message } = await api(this.config).message.fetchMT({
        id: params.id,
        messagehistory: true
      })
      this.list[message.id] = message
    },
    async spam(params) {
      await api(this.config).message.spam(params.id, params.groupid)

      this.remove({ id: params.id })

      const authStore = useAuthStore()
      authStore.work = {}
    },
    async searchMember(term, groupid) {
      const { messages } = await api(this.config).message.fetchMessages({
        subaction: 'searchmemb',
        search: term,
        groupid: groupid
      })
      await this.clear()
      for (const message of messages) {
        this.list[message.id] = message
      }
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
    getByGroup: (state) => (groupid) => { // Added for ModTools
      const ret = Object.values(state.list).filter(message => {
        return (
          message.groups.length > 0 &&
          parseInt(message.groups[0].groupid) === parseInt(groupid)
        )
      })
      return ret
    },
  },
})
