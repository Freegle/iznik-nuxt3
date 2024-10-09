import BaseAPI from '@/api/BaseAPI'

export default class ChatAPI extends BaseAPI {
  fetchMessages(chatid) {
    return this.$getv2(`/chat/${chatid}/message`)
  }
  fetchMessagesMT(chatid,params) {
    return this.$get(`/chat/rooms/${chatid}/messages`,params)
  }

  /*async fetchMT2(params) {
    console.log('ChatAPI fetchMT2',params)
    return await this.$get('/chat/rooms',params)
  }

  async fetchMT(chatid, { limit, context }) {
    console.log('ChatAPI fetchMT',chatid, limit, context)
    if( chatid) {
      return this.$get(
        `/chat/rooms/${chatid}/messages`,
        { limit, context })
        //function(data) {
        //  if (data && data.ret === 2) {
        //    // We handle this in the chat page
        //    return false
        //  } else {
        //    return true
        //  }
        //}
      //)
    }
    return await this.$get('/chat/rooms')
    //return await this.$get(`/chatmessages`, { limit, context })    
  }*/

  async fetchReviewChatsMT(params){
    return await this.$get(`/chatmessages`, params)
  }

  async listChatsMT(params) {
    console.log('ChatAPI listChatsMT', params)
    return await this.$get('/chat/rooms',params)
  }

  async listChats(since, search, keepChat, logError) {
    return await this.$getv2(
      '/chat?includeClosed=true',
      {
        since,
        search,
        keepChat,
      },
      logError
    )
  }

  fetchChat(chatid, logError) {
    return this.$getv2('/chat/' + chatid, {}, logError)
  }

  markRead(chatid, lastmsg, allowback) {
    return this.$post('/chatrooms', {
      id: chatid,
      lastmsgseen: lastmsg,
      allowback,
    })
  }

  deleteMessage(messageId) {
    return this.$del(`/chatmessages?id=${messageId}`)
  }

  openChat(params, logError) {
    return this.$put('/chat/rooms', params, logError)
  }

  async send(data) {
    return await this.$postv2('/chat/' + data.roomid + '/message', data)
  }

  async sendMT(data) {
    return await this.$post('/chatmessages', data)
  }

  nudge(chatid) {
    return this.$post('/chatrooms', {
      id: chatid,
      action: 'Nudge',
    })
  }

  hideChat(chatid) {
    return this.$post('/chatrooms', { id: chatid, status: 'Closed' })
  }

  blockChat(chatid) {
    return this.$post('/chatrooms', { id: chatid, status: 'Blocked' })
  }

  unHideChat(chatid) {
    return this.$post('/chatrooms', { id: chatid, status: 'Online' })
  }

  rsvp(id, chatid, value) {
    return this.$patch('/chatmessages', {
      roomid: chatid,
      id,
      replyexpected: value,
    })
  }

  typing(chatid) {
    return this.$post('/chatrooms', { id: chatid, action: 'Typing' })
  }
}
