import { defineStore } from 'pinia'
import api from '~/api'

export const useChatMessageStore = defineStore({
  id: 'chatmessage',
  state: () => ({
    messages: {},
    users: {},
    contexts: {}
  }),
  actions: {
    init(config) {
      this.config = config
    },
    clearMessages(chatid) {
      this.messages[chatid] = {}
    },
    clearMessage(payload) {
      this.messages[payload.chatid][payload.id] = null
    },
    mergeMessages(payload) {
      const chatid = payload.id + ''
      const messages =
        typeof payload.messages === 'object'
          ? Object.values(payload.messages)
          : payload.messages
      console.log('mergeMessages', typeof messages)

      if (messages) {
        // We've seen messages be undefined in some flaky network cases.
        if (!this.messages[chatid]) {
          // Again, don't use an array as this will be sparse.
          this.messages[chatid] = {}
        }

        for (const message of messages) {
          message.message = message.message + ''
          this.messages[chatid][message.id] = message
        }
      }
    },
    mergeUsers(payload) {
      const chatid = payload.id + ''
      const users =
        typeof payload.users === 'object'
          ? Object.values(payload.users)
          : payload.users

      if (!this.users[chatid]) {
        // Use an object rather than an array so that it's sparse and more efficient.  Surprisingly effective for
        // performance.
        this.users[chatid] = {}
      }

      for (const user of users) {
        this.users[chatid][user.id] = user
      }
    },

    setContext(params) {
      this.contexts[params.id] = params.ctx
    },

    clearContext(params) {
      this.setContext({ id: params.chatid, ctx: null })
    },

    async fetch(params) {
      const { chatid, noContext, groupid, limit } = params

      let ctx = null

      if (!noContext) {
        ctx = this.contexts[chatid] || null
      }

      const { chatmessages, chatusers, context } = await api(this.config).chat.fetchMT(
        chatid,
        {
          limit: limit || 10,
          groupid: groupid,
          context: ctx
        }
      )
      console.log('chatmessage', chatmessages?.length, chatusers?.length, context)

      if (chatmessages) {
        this.mergeMessages({
          id: chatid,
          messages: chatmessages
        })
      }

      if (chatusers) {
        this.mergeUsers({
          id: chatid,
          users: chatusers
        })
      }

      if (!noContext) {
        this.setContext({
          id: chatid,
          ctx: context || null
        })
      }
    },

    async send(params) {
      await api(this.config).chat.send(params)

      // Get the latest messages back.  Passing no context will fetch the latest.
      await this.fetch({
        chatid: params.roomid,
        noContext: true
      })
    },

    async nudge({ roomid }) {
      await api(this.config).chat.nudge(roomid)

      await this.fetch({
        chatid: roomid,
        noContext: true
      })
    },

    async rsvp({ id, roomid, value }) {
      await api(this.config).chat.rsvp(roomid, id, value)
    },

    async hold({ id, chatid }) {
      await api(this.config).chat.hold(id)
      await this.fetch({
        chatid: chatid,
        noContext: true
      })
    },

    async release({ id, chatid }) {
      await api(this.config).chat.release(id)
      await this.fetch({
        chatid: chatid,
        noContext: true
      })
    },

    async reject({ id, chatid }) {
      await api(this.config).chat.reject(id)
      this.clearMessage({
        id,
        chatid
      })
    },

    async approve({ id, chatid }) {
      await api(this.config).chat.approve(id)

      this.clearMessage({
        id,
        chatid
      })

      console.log('TODO: useChatMessageStore: auth/fetchUser')
      /*dispatch(
        'auth/fetchUser',
        {
          components: ['work'],
          force: true
        },
        {
          root: true
        }
      )*/
    },

    async whitelist({ id, chatid }) {
      await api(this.config).chat.whitelist(id)

      this.clearMessage({
        id,
        chatid
      })

      console.log('TODO: useChatMessageStore: auth/fetchUser')
      /*dispatch(
        'auth/fetchUser',
        {
          components: ['work'],
          force: true
        },
        {
          root: true
        }
      )*/
    },

    async redact({ id, chatid }) {
      await api(this.config).chat.redact(id)
      await this.fetch({
        chatid: chatid,
        noContext: true
      })
    }



  },
  getters: {
    getMessages: (state) => (chatid) => {
      chatid = chatid + ''
      const ret = state.messages[chatid]
        ? Object.values(state.messages[chatid])
        : []
      return ret
    },

    getUsers: (state) => (chatid) => {
      return state.users[chatid] ? Object.values(state.users[chatid]) : []
    },

    getUsers: (state) => (chatid, userid) => {
      return state.users[chatid][userid]
    },

    getContext: (state) => (id) => {
      return state.contexts[id]
    },
  },
})
