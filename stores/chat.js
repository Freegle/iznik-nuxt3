import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import api from '~/api'
import { useAuthStore } from '~/stores/auth'
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc'

export const useChatStore = defineStore({
  id: 'chat',
  state: () => ({
    list: [],
    listByChatId: {},
    listByChatMessageId: {},
    messages: {},
    searchSince: null,
    showContactDetailsAskModal: false,
    currentChatMT: null,
    lastSearchMT: null,
  }),
  actions: {
    clear(){
      this.list = []
      this.listByChatId = {}
      this.listByChatMessageId = {}
      this.messages = {}
      this.searchSince = null
      this.showContactDetailsAskModal = false
      this.currentChatMT = null
      this.lastSearchMT = null
    },
    init(config) {
      this.config = config
      this.route = useRoute()
    },
    async listChatsMT(params){
      console.log('useChatStore listChatsMT', params)
      params = params || {
        chattypes: ['User2Mod', 'Mod2Mod'],
        search: params && params.search ? params.search : null
      }
      params.summary = true
  
      this.lastSearchMT = params.search
  
      try {
        let current = null
  
        // We might have a current chat selected.  We want to make sure that we don't lose it.  This can happen if
        // we search for an old chat that we wouldn't normally return.
        const chatid = parseInt(this.currentChatMT)
        current = chatid && this.list[chatid] ? this.list[chatid] : null
  
        const { chatrooms } = await api(this.config).chat.listChatsMT(params)
        //console.log('useChatStore listChatsMT chatrooms', chatrooms)
        this.list = chatrooms
        chatrooms.forEach((c) => {
          // If we already have the chat with this date then don't set it - this avoids reactivity causing a slew of
          // component updates for no good reason.
          if (
            !this.listByChatId[c.id] ||
            this.listByChatId[c.id].lastdate !== c.lastdate
          ) {
            this.listByChatId[c.id] = c
          }
        })
  
      } catch (e) {
        // This happens a lot on mobile when the network is flaky.  It's not necessarily an end-user visible error,
        // so there is no point letting it ripple up to Sentry.
        if (!params.noerror) {
          throw e
        }
      }
    },
    async fetchReviewChatsMT(id, params){
      this.clear()
      const { chatmessages, chatreports } = await api(this.config).chat.fetchReviewChatsMT(params)
      const messages = chatmessages
      const deduped = [] // Chat review seems to have duplicate message id so only save first

      const messageStore = useMessageStore()
      messages.forEach((m) => {
        if( !deduped.find((m2) => m2.id===m.id)) deduped.push(m)
        if( m.refmsg) {
          m.refmsgid = m.refmsg.id
          messageStore.fetch(m.refmsg.id, true)
        }
        this.listByChatId[m.chatid] = m.chatroom
        this.listByChatMessageId[m.id] = m
      })
      this.messages[id] = deduped
    },
    removeMessageMT(chatid,id){
      const foundix = this.messages[chatid].findIndex((m) => m.id==id)
      console.log('removeMessageMT',foundix)
      if( foundix!==-1) delete this.messages[chatid][foundix]
    },
    async fetchChats(search, logError, keepChat) {
      let since = null

      if (this.searchSince) {
        since = dayjs(this.searchSince).toISOString()
      }
      // TODO Amend ChatAPI v2 to support chattypes
      let chats = []
      const miscStore = useMiscStore() // MT ADDED
      if( miscStore.modtools){
        const { chatrooms } = await api(this.config).chat.listChatsMT({ // v1: /chat/rooms
          chattypes: ['User2Mod', 'Mod2Mod']
        })
        chats = chatrooms
      }
      else {
        chats = await api(this.config).chat.listChats( // v2: /chat
          since,
          search,
          keepChat,
          logError
        )
      }
      if( !chats) return

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
        const chat = await api(this.config).chat.fetchChat(id, false)
        this.listByChatId[id] = chat
      }
    },
    async fetchMessages(id, force) {
      // console.log('fetchMessages A',id)

      let messages = []
      const miscStore = useMiscStore() // MT ADDED
      if( miscStore.modtools){
        const params = {
          limit: 10,
          modtools: true
        }
        const { chatmessages } = await api(this.config).chat.fetchMessagesMT(id,params)
        messages = chatmessages
      } else{
        messages = await api(this.config).chat.fetchMessages(id)
      }

      const update = () => {
        this.messages[id] = messages

        messages.forEach((m) => {
          this.listByChatMessageId[m.id] = m
        })
      }

      // Update the store with care - we want to pick up new/changed messages but we don't want to trigger
      // unnecessary reactivity updates if we have fetched a message that is already in the cache. The `force` argument
      // skips the check.
      //
      // Chat messages usually don't change; if they do then you need to use the force parameter
      if (this.messages[id]?.length !== messages.length) {
        update()
      } else if (force) {
        update()
      }

      return messages
    },
    async markRead(id) {
      const chat = this.listByChatId[id]

      if (chat?.unseen > 0) {
        // Cheat and set the value in the store, which makes it look like it worked very rapidly.  This speeds
        // things up a lot, and when we use this we expect to then call fetchChats after we've finished.
        this.listByChatId[id].unseen = 0
        await api(this.config).chat.markRead(id, chat.lastmsg, false)
      }
    },
    async markUnread(chatid, prevmsgid) {
      await api(this.config).chat.markRead(chatid, prevmsgid, true)
      await this.fetchChat(chatid)
    },
    async deleteMessage(chatId, messageId) {
      await api(this.config).chat.deleteMessage(messageId)
      this.fetchMessages(chatId, true)
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

      if (refmsgid) {
        // The message might have changed (e.g. number of replies).
        useMessageStore().fetch(refmsgid, true)
      }
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
      // We might have a type override.
      const data = {
        chattype: params.chattype ? params.chattype : 'User2User',
        groupid: params.groupid,
        userid: params.userid,
      }

      if ('updateRoster' in params) {
        data.updateRoster = params.updateRoster
      }

      const id = await this.openChat(data)

      return id
    },
    async hide(id) {
      await api(this.config).chat.hideChat(id)

      // Don't fetch chats.  We might be called in a loop and once we've completed the caller normally routes.
    },
    async unhide(id) {
      await api(this.config).chat.unHideChat(id)
      await this.fetchChat(id)
      await this.fetchChats(null, false, id)
    },
    async block(id) {
      await api(this.config).chat.blockChat(id)

      // Don't fetch chats.  We might be called in a loop and once we've completed the caller normally routes.
    },
    async pollForChatUpdates() {
      const authStore = useAuthStore()

      const myid = authStore.user?.id
      if (myid) {
        // If we are looking at a specific chat then we want to make sure we don't lose it by polling
        let keepChat = null

        if (this.route?.path?.startsWith('/chats/')) {
          // Get id after /chats/
          keepChat = parseInt(this.route.path.substring(7))
        }

        const search = this.route?.query?.search || null

        // Don't want to log any errors to Sentry - they can happen due to timing windows.
        await this.fetchChats(search, false, keepChat)
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
      const miscStore = useMiscStore() // MT ADDED
      // count chats with unseen messages
      let ret = 0
      const authStore = useAuthStore()
      const myid = authStore.user?.id

      // Scan listBychatId adding chat.unseen
      Object.keys(state.listByChatId).forEach((key) => {
        if (miscStore.modtools) {
          const chat = state.listByChatId[key]
          //console.log('unreadCount',chat.chattype,chat.unseen,chat.user1,chat.user2,myid)
          // We count chats between mods, and chats between other members and mods.
          if (chat.chattype === 'Mod2Mod') {
            ret += chat.unseen
          } else if (chat.chattype === 'User2Mod' && chat.user1 !== myid) {
            ret += chat.unseen
          }
          // Otherwise we count chats between users, and our chats to mods.
        } else if (state.listByChatId[key].status !== 'Closed') {
          ret += state.listByChatId[key].unseen
        }
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
