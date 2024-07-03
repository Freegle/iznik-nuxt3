import { useAuthStore } from '@/stores/auth'
import { useGroupStore } from '@/stores/group'
import { useMessageStore } from '../../stores/message'
import { useMiscStore } from '@/stores/misc'

const busy = ref(false)
const context = ref(null)
const groupid = ref(0)
const group = ref(null)
const limit = ref(2)
const workType = ref(null)
const show = ref(0)

const collection = ref(null)
const messageTerm = ref(null)
const memberTerm = ref(null)
const modalOpen = ref(false)
const nextAfterRemoved = ref(null)

const distance = ref(10)

const summary = computed(() => {
  const miscStore = useMiscStore()
  const ret = miscStore.get('modtoolsMessagesApprovedSummary')
  return ret === undefined ? false : ret
})

// mixin/modMessagesPage
const messages = computed(() => {
  const messageStore = useMessageStore()
  let messages

  if (groupid.value) {
    messages = messageStore.getByGroup(groupid.value)
  } else {
    messages = messageStore.all
  }
  // console.log('useModMessages messages', groupid.value, messages.length)
  // We need to sort as otherwise new messages may appear at the end.
  messages.sort((a, b) => {
    if (a.groups && b.groups) {
      return (
        new Date(b.groups[0].arrival).getTime() -
        new Date(a.groups[0].arrival).getTime()
      )
    } else {
      return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
    }
  })

  return messages
})

const visibleMessages = computed(() => {
  const msgs = messages.value
  // console.log('useModMessages visibleMessages', show.value, msgs?.length)
  if (show.value === 0 || !msgs || msgs.length === 0) return []
  return msgs.slice(0, show.value)
})

async function loadMore($state) {
  const messageStore = useMessageStore()
  console.log('uMM loadMore', groupid.value)
  if (!groupid.value) {
    console.log('uMM loadMore no groupid')
    $state.complete()
    return
  }
  let messages = messageStore.getByGroup(groupid.value)
  const prevmessagecount = messages.length

  await messageStore.fetchMessages({
    groupid: groupid.value,
    collection: collection.value,
    modtools: true,
    summary: false,
    limit: messages.length + distance.value
  })
  messages = messageStore.getByGroup(groupid.value)
  console.log('uMM loadMore NOW', prevmessagecount, messages.length)
  if (prevmessagecount === messages.length) {
    $state.complete()
  } else {
    //$state.complete()
    $state.loaded()
  }
  show.value = messages.length
}

watch(groupid, async (newVal) => {
  //console.log("useModMessages watch groupid", newVal)
  context.value = null
  show.value = 0
  const messageStore = useMessageStore()
  messageStore.clear()

  const groupStore = useGroupStore()
  await groupStore.fetchMT({
    id: newVal
  })
  group.value = await groupStore.fetch(newVal)
})

watch(group, async (newValue, oldValue) => {
  //console.log("===useModMessages watch group", newValue, oldValue, groupid.value)
  // We have this watch because we may need to fetch a group that we have remembered.  The mounted()
  // call may happen before we have restored the persisted state, so we can't initiate the fetch there.
  if (oldValue === null || oldValue.id !== groupid.value) {
    const groupStore = useGroupStore()
    await groupStore.fetch(groupid.value)
  }
})


export function setupModMessages() {
  const work = computed(() => {
    // Count for the type of work we're interested in.
    try {
      const authStore = useAuthStore()
      const work = authStore.work
      //console.log(">>>>useModMessages get work", workType.value, work)
      if (!work) return 0
      const count = workType.value ? work[workType.value] : 0
      return count
    } catch (e) {
      console.log('>>>>useModMessages exception', e.message)
      return 0
    }
  })
  watch(work, async (newVal, oldVal) => {
    //console.log('<<<<useModMessages watch work', newVal, oldVal, modalOpen.value)
    let doFetch = false

    /* TODO if (modalOpen.value && Date.now() - modalOpen.value > 10 * 60 * 1000) {
      // We don't always seem to get the modal hidden event, so assume any modals open for a long time have actually
      // closed.
      modalOpen.value = null
    }*/

    const messageStore = useMessageStore()
    const miscStore = useMiscStore()

    //if (!modalOpen.value) {
    if (newVal > oldVal) {
      // There's new stuff to fetch.
      //console.log('Fetch')
      await messageStore.clearContext()
      doFetch = true
    } else {
      const visible = miscStore.get('visible')
      //console.log('Visible', visible)

      if (!visible) {
        // If we're not visible, then clear what we have in the store.  We don't want to do that under our own
        // feet, but if we do this then we will pick up changes from other people and avoid confusion.
        await messageStore.clear()
        doFetch = true
      }
    }

    if (doFetch) {
      //console.log('Fetch')
      await messageStore.clearContext()
      context.value = null

      await messageStore.fetchMessages({
        groupid: groupid.value,
        collection: collection.value,
        modtools: true,
        summary: false,
        limit: Math.max(limit.value, newVal)
      })

      // Force them to show.
      let messages

      if (groupid.value) {
        messages = messageStore.getByGroup(groupid.value)
      } else {
        messages = messageStore.all
      }

      show.value = messages.length
    }
    //}
  })

  return {
    busy,
    context,
    group,
    groupid,
    limit,
    workType,
    show,
    collection,
    messageTerm,
    memberTerm,
    nextAfterRemoved,
    distance,
    summary,
    messages,
    visibleMessages,
    work,
    loadMore
  }
}
