import { useChatStore } from '~/stores/chat'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'

export function chatCollate(msgs) {
  const ret = []
  let last = ''

  for (let i = 0; i < msgs.length; i++) {
    if (
      i + 1 < msgs.length &&
      msgs[i].sameasnext &&
      msgs[i].message &&
      msgs[i].type === 'Default' &&
      msgs[i + 1].type === 'Default' &&
      !msgs[i].refmsg &&
      !msgs[i + 1].refmsg &&
      msgs[i + 1].message &&
      (!msgs[i].replyexpected || msgs[i].replyreceived) &&
      new Date(msgs[i + 1].date).getTime() - new Date(msgs[i].date).getTime() <
        10 * 60 * 1000
    ) {
      // The next message is within from the same user, within ten minutes, and not expecting a reply (in which
      // case we want to show that).   Collate.
      last += '\n' + msgs[i].message
    } else if (last) {
      // We have collated text to pull in.  Need to avoid references.
      const thisone = JSON.parse(JSON.stringify(msgs[i]))
      thisone.message = last + '\n' + msgs[i].message
      ret.push(thisone)
      last = ''
    } else {
      ret.push(msgs[i])
    }
  }

  return ret
}

export function setupChat(selectedChatId) {
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const authStore = useAuthStore()

  const chat = computed(() => {
    return selectedChatId ? chatStore.byId(selectedChatId) : null
  })

  const myid = authStore.user?.id

  const otheruserid = computed(() => {
    // The user who isn't us.
    let ret = null

    if (chat && myid && chat.chattype === 'User2User' && chat.user1) {
      ret = chat.user1 === myid ? chat.user2 : chat.user1
    }

    return ret
  })

  const unseen = computed(() => chat?.unseen)

  return {
    chat,
    unseen,
    chatmessages: computed(() => {
      return chatStore.messagesById(selectedChatId)
    }),
    otheruserid,
    otheruser: computed(() => {
      let user = null

      if (chat?.value?.otheruid) {
        user = userStore.byId(chat.value.otheruid)
      }

      return user
    }),
  }
}
