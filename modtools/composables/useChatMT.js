import pluralize from 'pluralize'
import { computed } from '#imports'
import { useChatStore } from '~/stores/chat'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { twem } from '~/composables/useTwem'
import { milesAway } from '~/composables/useDistance'
import { MT_EMAIL_REGEX } from '~/constants'

// MT-specific shared base functionality
function useChatSharedMT(chatId) {
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const authStore = useAuthStore()

  const myid = authStore.user?.id

  const chat = computed(() => {
    return chatId ? chatStore.byChatId(chatId) : null
  })

  // MT: Handle otheruser for User2Mod chats where otheruid may not be set
  const otheruser = computed(() => {
    let otheruid = chat.value?.otheruid
    let user = null

    if (!otheruid) {
      // MT: try user1id or user1.id
      otheruid = chat.value?.user1id || chat.value?.user1?.id
    }

    if (otheruid) {
      user = userStore.byId(otheruid)
    }

    // Final fallback: use user1 object directly if available
    if (!user && chat.value?.user1) {
      user = chat.value.user1
    }

    return user
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

// MT-specific setup chat function
export function setupChatMT(selectedChatId, chatMessageId) {
  const { chatStore, authStore, myid, chat, otheruser } =
    useChatSharedMT(selectedChatId)

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

  const unseen = computed(() => chat?.value?.unseen)

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

  let chatmessage = null

  if (chatMessageId) {
    chatmessage = computed(() => chatStore.messageById(chatMessageId))
  }

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

// MT-specific fetch referenced message
export async function fetchReferencedMessageMT(chatid, id) {
  const chatStore = useChatStore()
  const chatmessage = chatStore.messageById(id)

  // MT: chatmessage.refmsg may already be set and chatmessage.refmsgid not set
  if (chatmessage?.refmsgid) {
    const messageStore = useMessageStore()

    try {
      await messageStore.fetch(chatmessage.refmsgid)
    } catch (e) {
      console.log('Failed to fetch referenced message', e)
    }
  }
}

// MT-specific chat message base composable with pov support
export function useChatMessageBaseMT(chatId, messageId, pov = null) {
  const { chatStore, authStore, chat, otheruser } = useChatSharedMT(chatId)
  const messageStore = useMessageStore()

  const chatmessage = computed(() => chatStore.messageById(messageId))

  const emessage = computed(() => {
    const m = chatmessage.value?.message

    if (m) {
      const trim = m
        .toString()
        .replace(/(\r\n|\r|\n){2,}/g, '$1\n')
        .trim()

      try {
        twem(trim)
      } catch (e) {
        console.error(e, trim, m)
      }
      return twem(trim)
    } else {
      return ''
    }
  })

  // MT: Determine message positioning based on pov for support chat viewing
  const messageIsFromCurrentUser = computed(() => {
    if (chat.value?.chattype === 'User2User') {
      // For User2User chats viewed by support, use pov to determine perspective
      if (pov === chat.value?.user1id) {
        return chat.value?.user1id === chatmessage.value?.userid
      } else {
        return chat.value?.user1id !== chatmessage.value?.userid
      }
    }
    // For User2Mod chats, messages from user1 (the member) appear on the left
    return chat.value?.user1id !== chatmessage.value?.userid
  })

  // MT: refmsg may already be populated directly on the message
  const refmsgid = computed(() => {
    if (chatmessage.value?.refmsg) return chatmessage.value.refmsg.id
    return chatmessage.value?.refmsgid
  })

  const refmsg = computed(() => {
    if (chatmessage.value?.refmsg) return chatmessage.value.refmsg
    return refmsgid.value ? messageStore?.byId(refmsgid.value) : null
  })

  const realMe = computed(() => {
    return authStore.user
  })

  // MT: me respects pov for viewing chats from different perspectives
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

  const myid = computed(() => {
    return me.value?.id
  })

  // MT: Profile image based on user1 (the member)
  const chatMessageProfileImage = computed(() => {
    return chat.value?.user1id !== chatmessage.value?.userid
      ? me.value?.profile?.paththumb
      : chat.value?.icon
  })

  // MT: Profile name based on user1 (the member)
  const chatMessageProfileName = computed(() => {
    return chat.value?.user1id !== chatmessage.value?.userid
      ? me.value?.displayname
      : otheruser.value?.displayname
  })

  const regexEmail = computed(() => {
    return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  })

  // MT: More specific email regex
  const regexEmailMT = computed(() => {
    return MT_EMAIL_REGEX.toString()
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
    regexEmailMT,
    refmsgid,
    refmsg,
    me,
    myid,
    otheruser,
    brokenImage,
    refetch,
    fetchMessage,
  }
}
