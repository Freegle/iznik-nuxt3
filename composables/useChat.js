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

export function setupChat(selectedChatId) {
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const authStore = useAuthStore()

  const myid = authStore.user?.id

  const chat = computed(() => {
    return selectedChatId ? chatStore.byId(selectedChatId) : null
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

    if (chat?.value?.otheruid) {
      user = userStore.byId(chat.value.otheruid)
    }

    return user
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

  return {
    chat,
    unseen,
    chatmessages,
    otheruser,
    mymessages,
    lastfromme,
    tooSoonToNudge: computed(() => {
      return (
        lastfromme.value > 0 &&
        new Date().getTime() - lastfromme.value < 24 * 60 * 60 * 1000
      )
    }),
    milesaway,
    milesstring,
    chatStore,
  }
}

export async function fetchReferencedMessage(chatid, id) {
  const chatStore = useChatStore()
  const chatmessages = chatStore.messagesById(chatid)
  // TODO MINOR Perf could restructure chat store a bit to avoid this loop.
  const chatmessage = chatmessages.find((m) => {
    return m.id === id
  })

  if (chatmessage?.refmsgid) {
    console.log('Need to fetch', chatmessage.refmsgid)
    const messageStore = useMessageStore()
    await messageStore.fetch(chatmessage.refmsgid)
  }
}
