import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import api from '~/api'

export const useChatStore = defineStore({
  id: 'chat',
  state: () => ({
    list: [],
    listById: {},
    messages: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetchChats(since, search) {
      if (since) {
        since = dayjs(since).toISOString()
      }

      const chats = await api(this.config).chat.listChats(since, search)
      this.list = chats

      chats.forEach((c) => {
        // If we already have the chat with this date then don't set it - this avoids reactivity causing a slew of
        // component updates for no good reason.
        if (
          !this.listById[c.id] ||
          this.listById[c.id].lastdate !== c.lastdate
        ) {
          this.listById[c.id] = c
        }
      })
    },
    async fetchChat(id) {
      if (id > 0) {
        const chat = await api(this.config).chat.fetchChat(id)
        this.listById[id] = chat
      }
    },
    async fetchMessages(id) {
      const messages = await api(this.config).chat.fetchMessages(id)

      // Update the store with care - we want to pick up new/changed messages but we don't want to trigger
      // unnecessary reactivity updates if we have fetched a message that is already in the cache.
      //
      // Chat messages are immutable.
      if (this.messages[id]?.length !== messages.length) {
        this.messages[id] = messages
      }

      return messages
    },
    markRead(id) {
      const chat = this.listById[id]

      if (chat?.unseen > 0) {
        // Cheat and set the value rather than fetch from the search.  This speeds things up a lot, and when we
        // use this we expect to then call fetchChats after we've finished.
        api(this.config).chat.markRead(id, chat.lastmsg, false)
        this.listById[id].unseen = 0
      }
    },
    async nudge(id) {
      await api(this.config).chat.nudge(id)
      this.fetchMessages(id)
    },
    async typing(chatid) {
      await api(this.config).chat.typing(chatid)
    },
    async send(chatid, message, addressid, imageid) {
      await api(this.config).chat.send({
        roomid: chatid,
        message,
        addressid,
        imageid,
      })

      // Get the latest messages back.
      this.fetchMessages(chatid)
    },
    async openChat(params) {
      let id = null
      let logIt = true

      try {
        const rsp = await api(this.config).chat.openChat(
          params,
          function (data) {
            if (data && data.ret === 4) {
              // Don't log errors for banned users.
              logIt = false
            } else {
              logIt = true
            }

            return logIt
          }
        )

        id = rsp.id
      } catch (e) {
        if (!logIt) {
          // Just pretend nothing happened.  This is better than showing the user an error, which will make them
          // try to find ways around the ban.
          console.log('Swallow exception')
        } else {
          console.log('Failed to open chat', e)
          throw e
        }
      }

      if (id) {
        await this.fetchChat(id)
      }

      return id
    },
    async openChatToMods(params) {
      const id = await this.openChat({
        chattype: 'User2Mod',
        groupid: params.groupid,
        userid: params.userid,
      })

      return id
    },
    async openChatToUser(params) {
      // We might have a type override.  Otherwise open a user chat on FD and mod chat on MT.
      const id = await this.openChat({
        chattype: params.chattype ? params.chattype : 'User2User',
        groupid: params.groupid,
        userid: params.userid,
      })

      return id
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.listById[id]
    },
    messagesById: (state) => {
      return (id) => (state.messages[id] ? state.messages[id] : [])
    },
    unreadCount: (state) => {
      // count chats with unseen messages
      return state.list
        ? state.list.reduce((total, chat) => (total += chat.unseen), 0)
        : 0
    },
  },
})
