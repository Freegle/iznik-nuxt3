// Try to make Messages+Pending page as smooth as possible with correct work counts:
// - Normally the background timed update of authStore.work forces a complete page reload as detected in useModMessages watch(work)
// - The page reload happens because the message store list is updated in messageStore.fetchMessagesMT()
// To avoid this problem, when a message is approved for example:
// - the store removes the approved message from the list
// - ModMessageButton approveIt()  calls modme checkWorkDeferGetMessages()
// - This sets miscStore.deferGetMessages
// - which in turn stops useModMessages watch(work) from updating the messages list
// - until another timed update occurs

import { useAuthStore } from '@/stores/auth'
import { useModGroupStore } from '@/stores/modgroup'
import { useMessageStore } from '../../stores/message'
import { useMiscStore } from '@/stores/misc'

const summarykey = ref(false)
const busy = ref(false)
const context = ref(null)
const groupid = ref(0)
const group = ref(null)
const limit = ref(10)
const workType = ref(null)
const show = ref(0)

const collection = ref(null)
const messageTerm = ref(null)
const memberTerm = ref(null)
const nextAfterRemoved = ref(null)

const distance = ref(10)

const summary = computed(() => {
  if (!summarykey.value) return false
  const miscStore = useMiscStore()
  const ret = miscStore.get(summarykey.value)
  return ret === undefined ? false : ret
})

const messages = computed(() => {
  const messageStore = useMessageStore()
  let messages

  if (groupid.value) {
    messages = messageStore.getByGroup(groupid.value)
  } else {
    messages = messageStore.all
  }
  // console.log('---messages groupid:', groupid.value, 'messages:', messages.length)
  // We need to sort as otherwise new messages may appear at the end.
  messages.sort((a, b) => {
  if (a.groups && b.groups) {
    //console.log('---messages sort:', a.groups[0].arrival, b.groups[0].arrival)
    return (
        new Date(b.groups[0].arrival).getTime() -
        new Date(a.groups[0].arrival).getTime()
      )
    } else {
      //console.log('###messages sort:', a.arrival, b.arrival)
      return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
    }
  })
  //console.log('###messages sort:', messages[0]?.groups[0]?.arrival)
  return messages
})

const visibleMessages = computed(() => {
  const msgs = messages.value
  //console.log('---visibleMessages', show.value, msgs?.length)
  if (show.value === 0 || !msgs || msgs.length === 0) return []
  return msgs.slice(0, show.value)
})

export function setupModMessages() {
  watch(groupid, async (newVal) => {
    context.value = null

    const modGroupStore = useModGroupStore()
    await modGroupStore.fetchIfNeedBeMT(newVal)
    group.value = modGroupStore.get(newVal)
    await getMessages()

    show.value = messages.value.length
  })

  /*watch(group, async (newValue, oldValue) => {
    console.log("===useModMessages watch group", newValue?.id, oldValue?.id, groupid.value)
    // We have this watch because we may need to fetch a group that we have remembered.  The mounted()
    // call may happen before we have restored the persisted state, so we can't initiate the fetch there.
    if (!oldValue || oldValue.id !== groupid.value) {
      const modGroupStore = useModGroupStore()
      await modGroupStore.get(groupid.value)
    }
  })*/

  const getMessages = async (workCount) => {
    //console.log('getMessages', collection.value, groupid.value, workCount)

    const messageStore = useMessageStore()
    messageStore.clearContext()
    context.value = null

    const params = {
      groupid: groupid.value,
      collection: collection.value, // Pending also gets PendingOther
      modtools: true,
      summary: false,
      //limit: Math.max(limit.value, newVal)
    }
    if (workCount) params.limit = Math.max(limit.value, workCount)
    //console.log('uMM getMessages',params.limit)
    await messageStore.fetchMessagesMT(params)

    // Force them to show.
    let messages

    if (groupid.value) {
      messages = messageStore.getByGroup(groupid.value)
    } else {
      messages = messageStore.all
    }

    show.value = messages.length
  }

  const work = computed(() => {
    // Count for the type of work we're interested in.
    try {
      const authStore = useAuthStore()
      const work = authStore.work
      // console.log(">>>>useModMessages get work", workType.value, work)
      if (!work) return 0
      if (!workType.value) return 0
      if (Array.isArray(workType.value)) {
        let count = 0
        for (const worktype of workType.value) {
          count += work[worktype]
        }
        return count
      }
      return work[workType.value]
    } catch (e) {
      console.log('>>>>useModMessages exception', e.message)
      return 0
    }
  })

  watch(work, async (newVal, oldVal) => {
    // console.log('<<<<useModMessages watch work. oldVal:', oldVal, 'newVal:', newVal)
    // if( collection.value!=='Pending') return
    let doFetch = false

    const messageStore = useMessageStore()
    const miscStore = useMiscStore()
    // console.log('uMM getMessages',miscStore.deferGetMessages)
    if (miscStore.deferGetMessages) return

    const bodyoverflow = document.body.style.overflow
    if (bodyoverflow !== 'hidden') {
      if (newVal > oldVal) {
        // There's new stuff to fetch.
        //console.log('Fetch')
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
        getMessages(newVal)
      }
    }
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
    summarykey,
    summary,
    messages,
    visibleMessages,
    work
  }
}
