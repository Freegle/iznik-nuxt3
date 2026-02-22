<template>
  <div>
    <client-only>
      <ScrollToTop :prepend="groupName" />
      <div class="d-flex justify-content-between flex-wrap">
        <ModGroupSelect
          v-model="chosengroupid"
          modonly
          remember="membersapproved"
        />
        <div v-if="groupid" class="d-flex">
          <ModMemberTypeSelect v-model="filter" />
          <b-button
            v-if="groupid"
            variant="white"
            class="ml-2"
            @click="addMember"
          >
            <v-icon icon="plus" /> Add
          </b-button>
          <b-button
            v-if="groupid"
            variant="white"
            class="ml-2"
            @click="banMember"
          >
            <v-icon icon="trash-alt" /> Ban
          </b-button>
          <ModAddMemberModal
            v-if="showAddMember"
            ref="addmodal"
            :groupid="groupid"
            @hidden="showAddMember = false"
          />
          <ModBanMemberModal
            v-if="showBanMember"
            ref="banmodal"
            :groupid="groupid"
            @hidden="showBanMember = false"
          />
          <ModMergeButton class="ml-2" />
          <ModMemberExportButton class="ml-2" :groupid="groupid" />
        </div>
        <ModMemberSearchbox :search="search" @search="startsearch" />
      </div>
      <div v-if="id || term">
        <p v-if="groupid && group" class="mt-1">
          This group has {{ pluralise('member', group.membercount, true) }}.
        </p>
        <ModMembers />
        <infinite-loading
          direction="top"
          force-use-infinite-wrapper="true"
          :distance="distance"
          :identifier="bump"
          @infinite="loadMore"
        >
          <template #spinner>
            <b-img lazy src="/loader.gif" alt="Loading" />
          </template>
          <template #complete>
            <notice-message v-if="!members?.length">
              There are no members to show at the moment.
            </notice-message>
          </template>
        </infinite-loading>
      </div>
      <NoticeMessage v-else variant="info" class="mt-2">
        Please select a community or search for someone across all your
        communities.
      </NoticeMessage>
    </client-only>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMemberStore } from '@/stores/member'
import { setupModMembers } from '@/composables/useModMembers'
import { useMe } from '~/composables/useMe'
import { pluralise } from '~/composables/usePluralise'

// Stores
const memberStore = useMemberStore()

// Composables
const modMembers = setupModMembers(true)
modMembers.context.value = null
modMembers.collection.value = 'Approved'

// Initialize groupid and search from route
const route = useRoute()
let gid = 0
if (route.params && 'id' in route.params && route.params.id)
  gid = parseInt(route.params.id)
modMembers.groupid.value = gid
let termInit = ''
if (route.params && 'term' in route.params && route.params.term)
  termInit = route.params.term
modMembers.search.value = termInit

const { myGroups } = useMe()

// Destructure modMembers for template access
const {
  bump,
  context,
  group,
  groupid,
  search,
  filter,
  sort,
  distance,
  members,
  loadMore,
} = modMembers

// Local state (formerly data())
const chosengroupid = ref(0)
const showAddMember = ref(false)
const showBanMember = ref(false)

// Template refs
const addmodal = ref(null)
const banmodal = ref(null)

// Computed properties
const id = computed(() => {
  try {
    const route = useRoute()
    if (route.params && 'id' in route.params && route.params.id) {
      return parseInt(route.params.id)
    }
  } catch (e) {
    console.error('members [[term]] id', e.message)
  }
  return 0
})

const term = computed(() => {
  const route = useRoute()
  if (route.params && 'term' in route.params && route.params.term)
    return route.params.term
  return null
})

const groupName = computed(() => {
  if (group.value) {
    return group.value.namedisplay
  }
  return null
})

// Watchers
watch(filter, (newVal) => {
  context.value = null
  memberStore.clear()
  bump.value++
})

watch(chosengroupid, (newVal) => {
  const router = useRouter()
  if (newVal !== id.value) {
    if (newVal === 0) {
      router.push('/members/approved/')
    } else {
      let path = '/members/approved/' + newVal
      if (search.value.length > 0) path += '/' + search.value
      router.push(path)
    }
  }
})

// Lifecycle
onMounted(() => {
  const route = useRoute()
  groupid.value = id.value
  chosengroupid.value = id.value
  search.value = ''
  if (route.params && 'term' in route.params && route.params.term) {
    search.value = route.params.term
  }

  // Reset infiniteLoading on return to page
  memberStore.clear()

  if (!groupid.value) {
    // If we have not selected a group, check if we are only a mod on one.
    // If so, then go to that group so that we don't need to bother selecting it.
    let countmod = 0
    let lastmod = null
    myGroups.value.forEach((g) => {
      if (g.role === 'Moderator' || g.role === 'Owner') {
        countmod++
        lastmod = g.id
      }
    })

    if (countmod === 1) {
      groupid.value = lastmod
      const router = useRouter()
      router.push('/members/approved/' + lastmod)
    }
  }

  if (term.value) {
    // Turn off sorting for searches
    sort.value = false
  } else {
    sort.value = true
  }
})

// Methods
function addMember() {
  showAddMember.value = true
  addmodal.value?.show()
}

function banMember() {
  showBanMember.value = true
  banmodal.value?.show()
}

function startsearch(searchTerm) {
  searchTerm = searchTerm.trim()
  search.value = searchTerm
  context.value = null
  memberStore.clear()
  const router = useRouter()
  let newpath = '/members/approved/'
  if (searchTerm) {
    newpath = '/members/approved/' + groupid.value + '/' + searchTerm
  } else if (groupid.value) {
    newpath = '/members/approved/' + groupid.value
  }
  if (newpath !== router.currentRoute.value.path) {
    router.push(newpath)
  } else {
    bump.value++
  }
}
</script>
