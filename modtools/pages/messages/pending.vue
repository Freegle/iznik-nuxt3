<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModCakeModal
        v-if="showCakeModal"
        ref="showCakeModal"
        @hidden="showCakeModal = false"
      />
      <ModAimsModal
        v-if="showAimsModal"
        ref="showAimsModal"
        @hidden="showAimsModal = false"
      />
      <!--      <ModFreeStock class="mb-2" />-->
      <!--NoticeMessage variant="info" class="mb-2 d-block d-md-none">
        <ModZoomStock color-class="text-black" />
      </NoticeMessage-->
      <div class="d-flex justify-content-between">
        <ModGroupSelect
          v-model="groupid"
          all
          modonly
          :work="['pending', 'pendingother']"
          remember="pending"
          :url-override="urlOverride"
        />
        <ModtoolsViewControl misckey="modtoolsMessagesPendingSummary" />
        <b-button variant="link" @click="loadAll"> Load all </b-button>
      </div>
      <NoticeMessage
        v-if="!messages.length && !busy && groupsreceived"
        class="mt-2"
      >
        There are no messages at the moment. This will refresh automatically.
      </NoticeMessage>
      <div v-if="groupsreceived">
        <ModMessages />
        <infinite-loading
          direction="top"
          force-use-infinite-wrapper="true"
          :identifier="bump"
          @infinite="loadMore"
        >
          <template #spinner>
            <b-img lazy src="/loader.gif" alt="Loading" />
          </template>
        </infinite-loading>
      </div>
      <NoticeMessage v-else class="mt-2"> Please wait... </NoticeMessage>

      <ModAffiliationConfirmModal
        v-if="affiliationGroup"
        ref="affiliation"
        :groupid="affiliationGroup"
      />
      <!--ModRulesModal v-if="rulesGroup" ref="rules" /-->

      <div ref="end" />
    </client-only>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { setupModMessages } from '~/composables/useModMessages'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'
import { useMe } from '~/composables/useMe'

const authStore = useAuthStore()
const messageStore = useMessageStore()
const miscStore = useMiscStore()
const modGroupStore = useModGroupStore()
const route = useRoute()

const {
  busy,
  context,
  group,
  groupid,
  limit,
  workType,
  show,
  collection,
  distance,
  summarykey,
  messages,
  visibleMessages,
  nextAfterRemoved,
  getMessages,
} = setupModMessages(true)

summarykey.value = 'modtoolsMessagesPendingSummary'
collection.value = 'Pending' // Pending also gets PendingOther
workType.value = ['pending', 'pendingother']

const { me, myGroups } = useMe()

// Data
const showCakeModal = ref(false)
const showAimsModal = ref(false)
const affiliationGroup = ref(null)
const shownRulePopup = ref(false)
const bump = ref(0)
const highlightMsgId = ref(null)
const urlOverride = ref(false)

// Template refs
const end = ref(null)
const rules = ref(null)

// Computed
const groups = computed(() => {
  return Object.values(modGroupStore.list)
})

const groupsreceived = computed(() => {
  return modGroupStore.received
})

const rulesGroup = computed(() => {
  if (!modGroupStore.received) return null
  let ret = null
  const mygroupsList = myGroups.value // myGroups has correct role
  for (const groupItem of groups.value) {
    const mygroup = mygroupsList.find((g) => g.id === groupItem.id)
    const groupRules = groupItem.rules ? JSON.parse(groupItem.rules) : null
    const missingRules = groupItem.rules
      ? [
          'limitgroups',
          'wastecarrier',
          'carboot',
          'chineselanterns',
          'carseats',
          'pondlife',
          'copyright',
          'porn',
        ].filter((rule) => !Object.keys(groupRules).includes(rule))
      : null

    if (
      groupItem.type === 'Freegle' &&
      mygroup?.role === 'Owner' &&
      groupItem.publish &&
      (!groupItem.rules || (missingRules && missingRules.length))
    ) {
      ret = groupItem.id
      break
    }
  }
  return ret
})

// Watch for rulesGroup changes and show popup when needed
watch(rulesGroup, (newVal) => {
  if (newVal && !shownRulePopup.value) {
    shownRulePopup.value = true
    rules.value?.show()
  }
})

// Watchers
watch(groupid, async (newVal) => {
  context.value = null
  await modGroupStore.fetchIfNeedBeMT(newVal)
  group.value = modGroupStore.get(newVal)
  show.value = 0
  bump.value++
})

watch(visibleMessages, (newVal) => {
  // Scroll to highlighted message when it appears in the list.
  if (highlightMsgId.value && newVal?.length) {
    const found = newVal.find((m) => m.id === highlightMsgId.value)
    if (found) {
      nextTick(() => {
        const el = document.getElementById('msg-' + highlightMsgId.value)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Clear highlight so we don't scroll again on future updates.
          highlightMsgId.value = null
        }
      })
    }
  }
})

// Lifecycle
onMounted(async () => {
  // Check for query params from duplicate message link.
  if (route.query.groupid !== undefined) {
    groupid.value = parseInt(route.query.groupid)
    // Mark that URL explicitly set the group (even if 0 for "All").
    urlOverride.value = true
  }
  if (route.query.msgid) {
    highlightMsgId.value = parseInt(route.query.msgid)
  }

  // Consider affiliation ask.
  const lastask = miscStore.get('lastaffiliationask')
  const now = new Date().getTime()

  // Ask for affiliation not too frequently.
  if (!lastask || now - lastask > 7 * 24 * 60 * 60 * 1000) {
    function shuffleArray(array) {
      return array.sort(() => Math.random() - 0.5)
    }
    const shuffledGroups = shuffleArray([...groups.value])

    for (const groupItem of shuffledGroups) {
      if (groupItem.myrole === 'Owner' || groupItem.myrole === 'Moderator') {
        const postdate = dayjs(groupItem.affiliationconfirmed)
        const daysago = dayjs().diff(postdate, 'day')
        if (!groupItem.affiliationconfirmed || daysago > 365) {
          affiliationGroup.value = groupItem.id
          break
        }
      }
    }

    miscStore.set({ key: 'lastaffiliationask', value: now })
  }

  // AIMS
  const user = authStore.user
  const lastaimsshow = user?.settings?.lastaimsshow

  if (!lastaimsshow || dayjs().diff(dayjs(lastaimsshow), 'days') > 365) {
    showAimsModal.value = true

    const settings = user.settings
    settings.lastaimsshow = dayjs().toISOString()
    await authStore.saveAndGet({
      settings,
    })
  }

  // CAKE
  if (!miscStore.get('cakeasked')) {
    showCakeModal.value = true
    miscStore.set({ key: 'cakeasked', value: true })
  }

  // Note: Don't restore remembered group here - ModGroupSelect handles it
  // via its remember prop. Doing it here would override URL params.
})

// Methods
async function loadAll() {
  // This is a bit of a hack - we clear the store and fetch 1000 messages, which is likely to be all of them.
  limit.value = 1000
  await getMessages()

  end.value?.scrollIntoView()
}

function destroy(oldid, nextid) {
  nextAfterRemoved.value = nextid
}

async function loadMore($state) {
  busy.value = true

  if (!me.value) {
    console.log('Ignore load more on MT page with no session.')
    $state.complete()
  } else if (show.value < messages.value.length) {
    // This means that we will gradually add the messages that we have fetched from the server into the DOM.
    // Doing that means that we will complete our initial render more rapidly and thus appear faster.
    show.value++
    $state.loaded()
  } else {
    const currentCount = Object.keys(messageStore.list).length

    const params = {
      groupid: groupid.value,
      collection: collection.value,
      modtools: true,
      summary: false,
      context: context.value,
      limit: messages.value.length + distance.value,
    }

    await messageStore.fetchMessagesMT(params)
    context.value = messageStore.context

    if (currentCount === Object.keys(messageStore.list).length) {
      $state.complete()
    } else {
      $state.loaded()
      show.value++
    }
  }
  busy.value = false
}

// Expose for template and tests
defineExpose({
  showCakeModal,
  showAimsModal,
  affiliationGroup,
  bump,
  highlightMsgId,
  urlOverride,
  groups,
  groupsreceived,
  rulesGroup,
  me,
  myGroups,
  busy,
  messages,
  groupid,
  limit,
  loadAll,
  destroy,
  loadMore,
})
</script>
