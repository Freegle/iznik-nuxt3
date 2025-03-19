// Simplified from MT2 mixin/modMembersPage

import { useModGroupStore } from '@/stores/modgroup'
import { useMemberStore } from '../stores/member'

const bump = ref(0)
const busy = ref(false)
const context = ref(null)
const groupid = ref(0)
const group = ref(null)
const limit = ref(0)
const search = ref(null)
const filter = ref('0')
// const workType = ref(null)
const show = ref(0)

const collection = ref(null)
const messageTerm = ref(null)
const memberTerm = ref(null)
const nextAfterRemoved = ref(null)

const distance = ref(10)


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
      return new Date(b.joined).getTime() - new Date(a.joined).getTime()
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
    if (limit.value === distance.value) {
      limit.value += distance.value
    }
    //console.log('UMM actually loadMore show', show.value, 'groupid', groupid.value, 'members', members.value.length, 'limit', limit.value, 'search', search.value, 'filter', filter.value)
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
    //console.log('UMM fetchMembers', params)
    const received = await memberStore.fetchMembers(params)
    //console.log('UMM received', received)
    //console.log('UMM got', members.value.length)
    context.value = memberStore.context

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
    if (membersstart !== members.value.length) {
      bump.value++
    }
    //console.log('UMM end', show.value, members.value.length)
  }
}

watch(groupid, async (newVal) => {
  // console.log("UMM watch groupid", newVal)
  context.value = null
  show.value = 0
  const memberStore = useMemberStore()
  memberStore.clear()

  const modGroupStore = useModGroupStore()
  if (newVal > 0) {
    await modGroupStore.fetchIfNeedBeMT(newVal)
    group.value = await modGroupStore.get(newVal)
  }
  bump.value++
})

export function setupModMembers() {
  /* MT3 NOT USED const work = computed(() => {
    // Count for the type of work we're interested in.
    try {
      const authStore = useAuthStore()
      const work = authStore.work
      console.log(">>>>UMM get work", workType.value, work)
      if (!work) return 0
      const count = workType.value ? work[workType.value] : 0
      return count
    } catch (e) {
      console.log('>>>>UMM exception', e.message)
      return 0
    }
  })*/

  return {
    bump, // Y
    busy, // Y
    context, // ?
    group, // ?
    groupid, // Y
    limit, // Y
    search, // Y
    filter, // Y
    // workType, // N
    show,
    collection, // Y
    messageTerm,
    memberTerm,
    nextAfterRemoved,
    distance, // Y
    members,
    visibleMembers, // Y
    // work, // N
    loadMore // Y
  }
}
