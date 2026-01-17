import pluralize from 'pluralize'
import { milesAway } from '~/composables/useDistance'
import { computed } from '#imports'
import { useChatStore } from '~/stores/chat'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { twem } from '~/composables/useTwem'

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

// Shared base functionality for both setupChat and useChatBase
function useChatShared(chatId) {
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const authStore = useAuthStore()

  const myid = authStore.user?.id

  const chat = computed(() => {
    return chatId ? chatStore.byChatId(chatId) : null
  })

  const otheruser = computed(() => {
    return chat.value?.otheruid ? userStore.byId(chat.value.otheruid) : null
  })

  return {
    chatStore,
    userStore,
    authStore,
    myid,
    chat,
    otheruser,
  }
}

export function setupChat(selectedChatId, chatMessageId) {
  const { chatStore, authStore, myid, chat, otheruser } =
    useChatShared(selectedChatId)

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

  const milesaway = computed(() =>
    milesAway(
      authStore.user?.lat,
      authStore.user?.lng,
      otheruser?.value?.lat,
      otheruser?.value?.lng
    )
  )

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
    chatmessage,
    chatStore,
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

export function useChatMessageBase(chatId, messageId, pov = null) {
  const { chatStore, userStore, authStore, myid, chat, otheruser } =
    useChatShared(chatId)
  const messageStore = useMessageStore()

  const chatmessage = computed(() => chatStore.messageById(messageId))

  const emessage = computed(() => {
    const m = chatmessage.value?.message

    if (m) {
      const trim = m.replace(/(\r\n|\r|\n){2,}/g, '$1\n').trim()

      try {
        twem(trim)
      } catch (e) {
        console.error(e, trim, m)
      }
      const ret = twem(trim)

      return ret
    } else {
      return null
    }
  })

  const messageIsFromCurrentUser = computed(() => {
    // If pov is provided (support/moderator viewing a User2User chat),
    // use pov to determine which side messages appear on
    if (pov && chat.value?.chattype === 'User2User') {
      // Messages from user1 appear on left when pov is user1, on right otherwise
      if (pov === chat.value?.user1id) {
        return chatmessage.value?.userid === chat.value?.user1id
      } else {
        return chatmessage.value?.userid !== chat.value?.user1id
      }
    }

    // Normal case: message is from current user if they sent it
    return chatmessage.value?.userid === myid
  })

  // MT context may have refmsg object directly on chatmessage instead of/in addition to refmsgid
  const refmsgid = computed(() => {
    if (chatmessage.value?.refmsg) return chatmessage.value.refmsg.id
    return chatmessage.value?.refmsgid
  })

  const refmsg = computed(() => {
    if (chatmessage.value?.refmsg) return chatmessage.value.refmsg
    return refmsgid.value ? messageStore?.byId(refmsgid.value) : null
  })

  // Real me is equivalent to authStore.user, which we already have as myid
  const realMe = computed(() => {
    return authStore.user
  })

  const me = computed(() => {
    if (!pov) {
      return realMe.value
    } else if (chat.value?.user1 && chat.value.user1.id === pov) {
      return chat.value.user1
    } else if (chat.value?.user2 && chat.value.user2.id === pov) {
      return chat.value.user2
    } else {
      return realMe.value
    }
  })

  // myid should be derived from me so it respects pov
  const myidComputed = computed(() => {
    return me.value?.id
  })

  // otheruser needs to be pov-aware for User2User chats viewed by moderators
  const otheruserComputed = computed(() => {
    // For User2User chats with pov, determine the "other" user relative to pov
    if (pov && chat.value?.chattype === 'User2User') {
      if (pov === chat.value?.user1id || pov === chat.value?.user1?.id) {
        // pov is user1, so other user is user2
        return chat.value?.user2 || userStore.byId(chat.value?.user2id)
      } else {
        // pov is user2, so other user is user1
        return chat.value?.user1 || userStore.byId(chat.value?.user1id)
      }
    }
    // Default: use the shared otheruser
    return otheruser.value
  })

  const chatMessageProfileImage = computed(() => {
    return chatmessage.value?.userid === myidComputed.value
      ? me.value?.profile?.paththumb
      : chat.value?.icon
  })

  const chatMessageProfileName = computed(() => {
    return chatmessage.value?.userid === myidComputed.value
      ? me.value?.displayname
      : otheruserComputed.value?.displayname
  })

  const regexEmail = computed(() => {
    return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  })

  function brokenImage(event) {
    event.target.src = '/defaultprofile.png'
  }

  function refetch() {
    if (chatmessage.value?.refmsgid) {
      messageStore.fetch(chatmessage.value.refmsgid)
    }
  }

  async function fetchMessage() {
    const id = chatmessage.value?.refmsgid

    if (id) {
      const groupStore = useGroupStore()

      // Fetch the message info.
      try {
        await messageStore.fetch(id)

        const message = messageStore.byId(id)

        if (message) {
          message.groups.forEach(async (g) => {
            await groupStore.fetch(g.groupid)
          })
        }
      } catch (e) {
        console.log('Message fetch failed', id, e)
      }
    }
  }

  return {
    chat,
    chatmessage,
    emessage,
    messageIsFromCurrentUser,
    chatMessageProfileImage,
    chatMessageProfileName,
    regexEmail,
    refmsgid,
    refmsg,
    me,
    myid: myidComputed,
    otheruser: otheruserComputed,
    brokenImage,
    refetch,
    fetchMessage,
  }
}
