import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import api from '~/api'

export const useChatStore = defineStore({
  id: 'chat',
  state: () => ({
    list: [],
    listByChatId: {},
    listByChatMessageId: {},
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
          !this.listByChatId[c.id] ||
          this.listByChatId[c.id].lastdate !== c.lastdate
        ) {
          this.listByChatId[c.id] = c
        }
      })
    },
    async fetchChat(id) {
      if (id > 0) {
        const chat = await api(this.config).chat.fetchChat(id)
        this.listByChatId[id] = chat
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

        messages.forEach((m) => {
          this.listByChatMessageId[m.id] = m
        })
      }

      return messages
    },
    markRead(id) {
      const chat = this.listByChatId[id]

      if (chat?.unseen > 0) {
        // Cheat and set the value rather than fetch from the search.  This speeds things up a lot, and when we
        // use this we expect to then call fetchChats after we've finished.
        api(this.config).chat.markRead(id, chat.lastmsg, false)
        this.listByChatId[id].unseen = 0
      }
    },
    async markUnread(chatid, prevmsgid) {
      await api(this.config).chat.markRead(chatid, prevmsgid, true)
      await this.fetchChat(chatid)
    },
    async nudge(id) {
      await api(this.config).chat.nudge(id)
      this.fetchMessages(id)
    },
    async typing(chatid) {
      await api(this.config).chat.typing(chatid)
    },
    async send(chatid, message, addressid, imageid, refmsgid) {
      const data = {
        roomid: chatid,
      }

      // Need to omit these if they are not set otherwise server doesn't like it.
      if (message) {
        data.message = message
      }

      if (addressid) {
        data.addressid = addressid
      }

      if (imageid) {
        data.imageid = imageid
      }

      if (refmsgid) {
        data.refmsgid = refmsgid
      }

      await api(this.config).chat.send(data)

      // Get the latest messages back.
      this.fetchMessages(chatid)
    },
    async report(chatid, reason, comments, refchatid) {
      await api(this.config).chat.send({
        roomid: chatid,
        reportreason: reason,
        message: comments,
        refchatid,
      })
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
    async openChatToMods(groupid) {
      const id = await this.openChat({
        chattype: 'User2Mod',
        groupid,
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
    async hide(id) {
      await api(this.config).chat.hideChat(id)

      // Don't fetch chats.  We might be called in a loop and once we've completed the caller normally routes.
    },
    async block(id) {
      await api(this.config).chat.blockChat(id)

      // Don't fetch chats.  We might be called in a loop and once we've completed the caller normally routes.
    },
    async pollForChatUpdates() {
      if (this.myid) {
        await this.fetchChats()
      }

      setTimeout(this.pollForChatUpdates, 30000)
    },
    async rsvp(id, roomid, value) {
      await api(this.config).chat.rsvp(id, roomid, value)
      await this.fetchChat(roomid)
    },
  },
  getters: {
    byChatId: (state) => {
      return (id) => state.listByChatId[id]
    },
    messagesById: (state) => {
      return (id) => (state.messages[id] ? state.messages[id] : [])
    },
    messageById: (state) => {
      return (id) => state.listByChatMessageId[id]
    },
    unreadCount: (state) => {
      // count chats with unseen messages
      let ret = 0

      // Scan listBychatId adding chat.unseen
      Object.keys(state.listByChatId).forEach((key) => {
        ret += state.listByChatId[key].unseen
      })

      return ret
    },
    toUser: (state) => (id) => {
      // We look in listByChatId not list.  This is because we might fetch a chat that isn't in the ones returned by
      // list, and it would get removed from list by the next poll.  But it will stay in listByChatId.
      let ret = null

      for (const c in state.listByChatId) {
        if (
          state.listByChatId[c].chattype === 'User2User' &&
          state.listByChatId[c].otheruid === id
        ) {
          ret = state.listByChatId[c]
          break
        }
      }
      return ret
    },
  },
})
