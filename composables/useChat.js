import pluralize from 'pluralize'
import { milesAway } from '../composables/useDistance'
import { useChatStore } from '~/stores/chat'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { useMessageStore } from '~/stores/message'

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

export function setupChat(selectedChatId, chatMessageId) {
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const authStore = useAuthStore()

  const myid = authStore.user?.id

  const chat = computed(() => {
    return selectedChatId ? chatStore.byChatId(selectedChatId) : null
  })

  const chatmessages = computed(() => {
    return chatStore.messagesById(selectedChatId)
  })

  const mymessages = computed(() => {
    return chatmessages.value.filter((m) => m.userid === myid)
  })

  const lastfromme = computed(() => {
    let last = 0

    mymessages.value.forEach((m) => {
      last = Math.max(last, new Date(m.date).getTime())
    })

    return last
  })

  const otheruser = computed(() => {
    let user = null

    if (!chat?.value?.otheruid) {
      chat.value.otheruid = chat.value.user1id || chat.value.user1?.id
    }
    if (chat?.value?.otheruid) {
      user = userStore.byId(chat.value.otheruid)
    }
    if (!user && chat?.value?.user1) {
      user = chat?.value?.user1
      return user
    }

    return user
  })

  const milesaway = computed(() => {
    if (authStore.user?.lat && otheruser?.value?.lat) {
      return milesAway(
        authStore.user?.lat,
        authStore.user?.lng,
        otheruser?.value?.lat,
        otheruser?.value?.lng
      )
    }
    if (otheruser?.value?.info?.milesaway)
      return otheruser?.value?.info?.milesaway
    return null
  })

  const milesstring = computed(
    () => pluralize('mile', milesaway.value, true) + ' away'
  )

  const unseen = computed(() => chat?.value?.unseen)

  let chatmessage = null

  if (chatMessageId) {
    chatmessage = computed(() => chatStore.messageById(chatMessageId))
  }

  // We use the time when this was instantiated.  This is to avoid tooSoonToNudge getting recalculated and
  // therefore forcing re-renders, which we've seen when doing perf analysis.
  // It doesn't matter too much if we say that it's too soon to nudge until the next
  // refresh.
  const now = new Date().getTime()
  const tooSoonToNudge = computed(() => {
    return lastfromme.value > 0 && now - lastfromme.value < 24 * 60 * 60 * 1000
  })

  return {
    chat,
    unseen,
    chatmessages,
    otheruser,
    mymessages,
    lastfromme,
    tooSoonToNudge,
    milesaway,
    milesstring,
    chatStore,
    chatmessage,
  }
}

export async function fetchReferencedMessage(chatid, id) {
  const chatStore = useChatStore()
  const chatmessage = chatStore.messageById(id)

  if (chatmessage?.refmsgid) {
    const messageStore = useMessageStore()

    try {
      await messageStore.fetch(chatmessage.refmsgid)
    } catch (e) {
      console.log('Failed to fetch referenced message', e)
    }
  }
}
