import { defineStore } from 'pinia'
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
    async fetchChats(since) {
      // TODO Don't lose currently selected old chat - see store in old code.
      const chats = await api(this.config).chat.listChats(since)
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
      const chat = await api(this.config).chat.fetchChat(id)
      this.listById[id] = chat
    },
    async fetchMessages(id) {
      const messages = await api(this.config).chat.fetchMessages(id)
      this.messages[id] = messages
      return messages
    },
    markRead(id) {
      if (this.list[id]?.unseen > 0) {
        // Cheat and set the value rather than fetch from the search.  This speeds things up a lot, and when we
        // use this we expect to then call fetchChats after we've finished.
        api(this.config).chat.markSeen(id)
        this.list[id].unseen = 0
      }
    },
    async nudge(id) {
      await api(this.config).chat.nudge(id)
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.listById[id]
    },
    messagesById: (state) => {
      return (id) => state.messages[id]
    },
  },
})
