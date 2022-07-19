import BaseAPI from '@/api/BaseAPI'

export default class ChatAPI extends BaseAPI {
  fetchMessages(chatid) {
    // TODO Chat paging
    return this.$getv2(`/chat/${chatid}/message`)
  }

  async listChats(since, search) {
    return await this.$getv2('/chat', {
      since,
      search,
    })
  }

  fetchChat(chatid) {
    return this.$getv2('/chat/' + chatid)
  }

  markRead(chatid, lastmsg, allowback) {
    return this.$post('/chatrooms', {
      id: chatid,
      lastmsgseen: lastmsg,
      allowback,
    })
  }

  openChat(params, logError) {
    return this.$put('/chat/rooms', params, logError)
  }

  send(data) {
    return this.$post('/chatmessages', data, function (data) {
      if (data && data.ret === 4) {
        // Don't log errors for banned users - handled elsewhere.
        return false
      } else {
        return true
      }
    })
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

  unseenCount(chatid) {
    return this.$get('/chatrooms', {
      count: true,
      chattypes: ['User2User', 'User2Mod'],
    })
  }

  hold(msgid) {
    return this.$post('/chatmessages', { id: msgid, action: 'Hold' })
  }

  release(msgid) {
    return this.$post('/chatmessages', { id: msgid, action: 'Release' })
  }

  redact(msgid) {
    return this.$post('/chatmessages', { id: msgid, action: 'Redact' })
  }

  reject(msgid) {
    return this.$post('/chatmessages', { id: msgid, action: 'Reject' })
  }

  approve(msgid) {
    return this.$post('/chatmessages', { id: msgid, action: 'Approve' })
  }

  whitelist(msgid) {
    return this.$post('/chatmessages', {
      id: msgid,
      action: 'ApproveAllFuture',
    })
  }

  rsvp(chatid, id, value) {
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
