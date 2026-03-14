import BaseAPI from '@/api/BaseAPI'

export default class ChatAPI extends BaseAPI {
  fetchMessages(chatid) {
    return this.$getv2(`/chat/${chatid}/message`)
  }

  fetchMessagesMT(chatid, params) {
    return this.$getv2(`/chat/${chatid}/message`, params)
  }

  async unseenCountMT() {
    const { count } = await this.$getv2('/chatrooms', {
      count: true,
      chattypes: ['User2Mod', 'Mod2Mod'],
    })
    return count
  }

  async fetchReviewChatsMT(params) {
    return await this.$getv2(`/chatmessages`, params)
  }

  async listChatsMT(params) {
    return await this.$getv2('/chat/rooms', params)
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

  fetchChatMT(chatid) {
    return this.$getv2('/chatrooms', {
      id: chatid,
      chattypes: ['User2Mod', 'Mod2Mod'],
    })
  }

  fetchChat(chatid, logError) {
    return this.$getv2('/chat/' + chatid, {}, logError)
  }

  markRead(chatid, lastmsg, allowback) {
    return this.$postv2('/chatrooms', {
      id: chatid,
      lastmsgseen: lastmsg,
      allowback,
    })
  }

  deleteMessage(messageId) {
    return this.$delv2(`/chatmessages?id=${messageId}`)
  }

  openChat(params, logError) {
    return this.$putv2('/chat/rooms', params, logError)
  }

  async send(data) {
    return await this.$postv2('/chat/' + data.roomid + '/message', data)
  }

  async sendMT(data) {
    return await this.$postv2('/chatmessages', data)
  }

  nudge(chatid) {
    return this.$postv2('/chatrooms', {
      id: chatid,
      action: 'Nudge',
    })
  }

  hideChat(chatid) {
    return this.$postv2('/chatrooms', { id: chatid, status: 'Closed' })
  }

  blockChat(chatid) {
    return this.$postv2('/chatrooms', { id: chatid, status: 'Blocked' })
  }

  unHideChat(chatid) {
    return this.$postv2('/chatrooms', { id: chatid, status: 'Online' })
  }

  rsvp(id, chatid, value) {
    return this.$patchv2('/chatmessages', {
      roomid: chatid,
      id,
      replyexpected: value,
    })
  }

  typing(chatid) {
    return this.$postv2('/chatrooms', { id: chatid, action: 'Typing' })
  }

  referToSupport(chatid) {
    return this.$postv2('/chatrooms', { id: chatid, action: 'ReferToSupport' })
  }
}
