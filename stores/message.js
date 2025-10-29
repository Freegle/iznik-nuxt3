// SEE WORK EXPLANATION IN useModMessages.js

import cloneDeep from 'lodash.clonedeep'
import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { nextTick } from 'vue'
import api from '~/api'
import { GROUP_REPOSTS, MESSAGE_EXPIRE_TIME } from '~/constants'
import { useGroupStore } from '~/stores/group'
import { APIError } from '~/api/BaseAPI'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '@/stores/misc'

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
              console.log('Message deleted, removing from store')

              // Remove from the main list
              delete this.list[id]

              // Remove from user's list if present
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
          }
        } else {
          try {
            this.fetchingCount++
            this.fetching[id] = api(this.config).message.fetch(id, false)
            this.fetchingCount--

            this.list[id] = await this.fetching[id]
            this.fetching[id] = null

            if (this.list[id]) {
              this.list[id].addedToCache = Math.round(Date.now() / 1000)
            }
          } catch (e) {
            console.log('Failed to fetch message', e)
            this.fetching[id] = null

            if (e instanceof APIError && e.response.status === 404) {
              // This can validly happen if a message is deleted under our feet.
              console.log('Message deleted, removing from store')

              // Remove from the main list
              delete this.list[id]

              // Remove from user's list if present
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
          const msgs = await api(this.config).message.fetch(
            left.join(','),
            false
          )

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
    async searchMT(params) {
      const { messages } = await api(this.config).message.fetchMessages({
        subaction: 'searchall',
        search: params.term,
        exactonly: true,
        groupid: params.groupid,
      })
      for (const message of messages) {
        // console.log('GOT message',message.id, typeof message.fromuser)
        this.list[message.id] = message
      }
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
    async updateMT(params) {
      // Rely on refresh elsewhere
      return await api(this.config).message.update(params)
    },
    async patch(params) {
      const data = await api(this.config).message.save(params)

      // Clear from store to ensure no attachments.
      this.remove({
        id: params.id,
      })

      const miscStore = useMiscStore()
      if (miscStore.modtools) {
        const message = await this.fetchMT({
          id: params.id,
          messagehistory: true,
        })
        if (message) {
          this.list[message.id] = message
        }
      } else {
        await this.fetch(params.id, true) // Gets message.fromuser as int not object
      }

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
    clearContext() {
      // Added for ModTools
      this.context = null
    },
    async fetchMessagesMT(params) {
      // Added for ModTools
      // console.error("===useMessageStore fetchMessagesMT",params)

      // if (!params.context) {
      //  params.context = this.context
      // }
      if (params.context) {
        // Ensure the context is a real object, in case it has been in the store.
        params.context = cloneDeep(params.context)
      }
      if (!params.context) params.context = null
      // console.log(">>> fetchMessMT params",params)

      const data = await api(this.config).message.fetchMessages(params)
      if (!data.messages) return
      const messages = data.messages
      const context = data.context // Can be undefined if search complete
      // console.log("===fetchMessMT context",context)
      // console.log("<<< fetchMessMT messages",messages.length)

      if (params.collection !== 'Draft') {
        // We don't use context for drafts - there aren't many.
        this.context = context
      }
      for (const message of messages) {
        // console.log('GOT message',message.id, typeof message.fromuser)
        if (!message.subject) message.subject = ''
        this.list[message.id] = message
      }
      // console.log('---fetchMessMT',this.context?.Date,this.context?.id, Object.values(this.list).length, messages.length)
    },
    async fetchMT(params) {
      // Added for ModTools
      const { message } = await api(this.config).message.fetchMT(params)
      if (message && !message.subject) message.subject = ''
      return message
    },
    async approveedits(params) {
      await api(this.config).message.approveEdits(params.id)

      this.remove({ id: params.id })
    },
    async revertedits(params) {
      await api(this.config).message.revertEdits(params.id)

      this.remove({ id: params.id })
    },
    async backToPending(id) {
      await api(this.config).message.update({
        id,
        action: 'BackToPending',
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
    },
    async reply(params) {
      await api(this.config).message.reply(
        params.id,
        params.groupid,
        params.subject,
        params.stdmsgid,
        params.body
      )
      // Do not remove from list
    },
    async hold(params) {
      await api(this.config).message.hold(params.id)
      const { message } = await api(this.config).message.fetchMT({
        id: params.id,
        messagehistory: true,
      })
      this.list[message.id] = message
    },
    async release(params) {
      await api(this.config).message.release(params.id)
      const { message } = await api(this.config).message.fetchMT({
        id: params.id,
        messagehistory: true,
      })
      this.list[message.id] = message
    },
    async spam(params) {
      await api(this.config).message.spam(params.id, params.groupid)

      this.remove({ id: params.id })
    },
    async move(params) {
      await api(this.config).message.update({
        id: params.id,
        groupid: params.groupid,
        action: 'Move',
      })

      await this.fetch(params.id, true)

      /* dispatch(
        'auth/fetchUser',
        {
          components: ['work'],
          force: true
        },
        {
          root: true
        }
      ) */
    },
    async searchMember(term, groupid) {
      const { messages } = await api(this.config).message.fetchMessages({
        subaction: 'searchmemb',
        search: term,
        groupid,
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
      return state.byUserList[userid] || []
    },
    getByGroup: (state) => (groupid) => {
      // Added for ModTools
      const ret = Object.values(state.list).filter((message) => {
        return (
          message.groups.length > 0 &&
          parseInt(message.groups[0].groupid) === parseInt(groupid)
        )
      })
      return ret
    },
  },
})
