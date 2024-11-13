// TODO Needs big clean up
import { useAuthStore } from '@/stores/auth'
import { useGroupStore } from '@/stores/group'
import { useMemberStore } from '../stores/member'
import { useMiscStore } from '@/stores/misc'
import { CaptureConsole } from '@sentry/integrations'

const bump = ref(0)
const busy = ref(false)
const context = ref(null)
const groupid = ref(0)
const group = ref(null)
const limit = ref(0)
const search = ref(null)
const filter = ref('0')
const workType = ref(null)
const show = ref(0)

const collection = ref(null)
const messageTerm = ref(null)
const memberTerm = ref(null)
const modalOpen = ref(false)
const nextAfterRemoved = ref(null)

const distance = ref(10)

/*const summary = computed(() => {
  const miscStore = useMiscStore()
  const ret = miscStore.get('modtoolsMessagesApprovedSummary')
  return ret === undefined ? false : ret
})*/

// mixin/modMembersPage
const members = computed(() => {
  //console.log('UMM members',groupid.value, bump.value)
  const memberStore = useMemberStore()
  let members

  if (groupid.value) {
    members = memberStore.getByGroup(groupid.value)
  } else {
    members = memberStore.all
  }
  if (!members) {
    //console.log('UMM no members')
    return []
  }
  // We need to sort as otherwise new members may appear at the end.
  members.sort((a, b) => {
    if (a.groups && b.groups) {
      return (
        new Date(b.groups[0].arrival).getTime() -
        new Date(a.groups[0].arrival).getTime()
      )
    } else {
      return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
    }
  })

  //console.log('UMM members sorted', members.length)
  //for( const member of members){
  //  console.log('UMM', member)
  //}
return members
})

const visibleMembers = computed(() => {
  const mbrs = members.value
  //console.log('UMM visibleMembers', show.value, mbrs?.length)
  if (show.value === 0 || !mbrs || mbrs.length === 0) return []
  return mbrs.slice(0, show.value)
})

const loadMore = async function ($state) {
  //console.log('UMM loadMore', show.value, groupid.value, members.value.length, visibleMembers.value.length)
  if (show.value < members.value.length) {
    //console.log('UMM loadMore inc show')
    show.value++
    $state.loaded()
  } else {
    const membersstart = members.value.length
    if( limit.value===distance.value){
      limit.value += distance.value
    }
    //console.log('UMM actually loadMore', show.value, groupid.value, members.value.length, limit.value, search.value, filter.value)
    const memberStore = useMemberStore()
    const params = {
      groupid: groupid.value,
      collection: collection.value,
      modtools: true,
      summary: false,
      context: context.value,
      limit: limit.value,
      search: search.value,
      filter: filter.value,
    }
    const received = await memberStore.fetchMembers(params)
    //console.log('UMM got', members.value.length)

    if (show.value < members.value.length) { // Just inc by one rather than set to members.value.length
      show.value++
    }
    if (show.value > members.value.length) {
      show.value = members.value.length
    }
    if (received === 0 || (show.value === members.value.length)) {
      $state.complete()
    }
    else {
      $state.loaded()
    }
    if( membersstart !== members.value.length){
      bump.value++
    }
    //console.log('UMM end', show.value, members.value.length)
  }
}

watch(groupid, async (newVal) => {
  //console.log("UMM watch groupid", newVal)
  context.value = null
  show.value = 0
  const memberStore = useMemberStore()
  memberStore.clear()

  const groupStore = useGroupStore()
  await groupStore.fetchMT({
    id: newVal
  })
  group.value = await groupStore.fetch(newVal)
})

/*watch(group, async (newValue, oldValue) => {
  console.log("===UMM watch group", newValue, oldValue, groupid.value)
  // We have this watch because we may need to fetch a group that we have remembered.  The mounted()
  // call may happen before we have restored the persisted state, so we can't initiate the fetch there.
  if (oldValue === null || oldValue.id !== groupid.value) {
    const groupStore = useGroupStore()
    await groupStore.fetch(groupid.value)
    
    const memberStore = useMemberStore()
    console.log('-------------------------------------fetchMembers')
    await memberStore.fetchMembers({
      groupid: groupid.value,
      collection: collection.value,
      modtools: true,
      summary: false,
      context: context.value,
      limit: limit.value,
      search: search.value,
      filter: filter.value
    })
  }
})*/


export function setupModMembers() {
  const work = computed(() => {
    // Count for the type of work we're interested in.
    try {
      const authStore = useAuthStore()
      const work = authStore.work
      //console.log(">>>>UMM get work", workType.value, work)
      if (!work) return 0
      const count = workType.value ? work[workType.value] : 0
      return count
    } catch (e) {
      console.log('>>>>UMM exception', e.message)
      return 0
    }
  })
  watch(work, async (newVal, oldVal) => {
    // TODO: Only want this to run if on Pending page
    //console.log('<<<<UMM watch work', newVal, oldVal, modalOpen.value)
    let doFetch = false

    /* TODO if (modalOpen.value && Date.now() - modalOpen.value > 10 * 60 * 1000) {
      // We don't always seem to get the modal hidden event, so assume any modals open for a long time have actually
      // closed.
      modalOpen.value = null
    }*/


    /* TODO const memberStore = useMemberStore()
    const miscStore = useMiscStore()

    //if (!modalOpen.value) {
    if (newVal > oldVal) {
      // There's new stuff to fetch.
      //console.log('Fetch')
      await memberStore.clearContext()
      doFetch = true
    } else {
      const visible = miscStore.get('visible')
      //console.log('Visible', visible)

      if (!visible) {
        // If we're not visible, then clear what we have in the store.  We don't want to do that under our own
        // feet, but if we do this then we will pick up changes from other people and avoid confusion.
        await memberStore.clear()
        doFetch = true
      }
    }

    if (doFetch) {
      //console.log('Fetch')
      await memberStore.clearContext()
      context.value = null

      await memberStore.fetchMembersMT({
        groupid: groupid.value,
        collection: collection.value,
        modtools: true,
        summary: false,
        limit: Math.max(limit.value, newVal)
      })

      // Force them to show.
      let members

      if (groupid.value) {
        members = memberStore.getByGroup(groupid.value)
      } else {
        members = memberStore.all
      }

      show.value = members.length
    }
    //}
    */
  })

  return {
    busy,
    context,
    group,
    groupid,
    limit,
    search,
    filter,
    workType,
    show,
    collection,
    messageTerm,
    memberTerm,
    nextAfterRemoved,
    distance,
    //summary,
    members,
    visibleMembers,
    work,
    loadMore
  }
}
