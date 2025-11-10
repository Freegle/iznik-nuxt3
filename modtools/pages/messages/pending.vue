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
        />
        <ModtoolsViewControl misckey="modtoolsMessagesPendingSummary" />
        <b-button variant="link" @click="loadAll"> Load all </b-button>
      </div>
      <NoticeMessage v-if="!messages.length && !busy" class="mt-2">
        There are no messages at the moment. This will refresh automatically.
      </NoticeMessage>
      <ModMessages />

      <ModAffiliationConfirmModal
        v-if="affiliationGroup"
        ref="affiliation"
        :groupid="affiliationGroup"
      />
      <ModRulesModal v-if="rulesGroup" ref="rules" />

      <div ref="end" />
    </client-only>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { setupModMessages } from '~/composables/useModMessages'
import { useAuthStore } from '@/stores/auth'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'
import me from '~/mixins/me.js'

export default {
  mixins: [me],
  async setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const modGroupStore = useModGroupStore()
    const modMessages = setupModMessages(true)
    modMessages.summarykey.value = 'modtoolsMessagesPendingSummary'
    // modMessages.collection.value = ['Pending','PendingOther']
    modMessages.collection.value = 'Pending' // Pending also gets PendingOther
    modMessages.workType.value = ['pending', 'pendingother']
    // modMessages.workType.value = 'pending'
    return {
      authStore,
      miscStore,
      modGroupStore,
      ...modMessages, // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
    }
  },
  data: function () {
    return {
      showCakeModal: false,
      showAimsModal: false,
      affiliationGroup: null,
      shownRulePopup: false,
    }
  },
  computed: {
    groups() {
      const ret = Object.values(this.modGroupStore.list)
      return ret
    },
    rulesGroup() {
      if (!this.modGroupStore.received) return null
      let ret = null
      const mygroups = this.myGroups // myGroups has correct role
      for (const group of this.groups) {
        const mygroup = mygroups.find((g) => g.id === group.id)
        const rules = group.rules ? JSON.parse(group.rules) : null
        const missingRules = group.rules
          ? [
              'limitgroups',
              'wastecarrier',
              'carboot',
              'chineselanterns',
              'carseats',
              'pondlife',
              'copyright',
              'porn',
            ].filter((rule) => !Object.keys(rules).includes(rule))
          : null

        if (
          group.type === 'Freegle' &&
          mygroup?.role === 'Owner' &&
          group.publish &&
          (!group.rules || (missingRules && missingRules.length))
        ) {
          // console.log('Missing rules', group.nameshort, missingRules)
          ret = group.id
          break
        }
      }
      if (ret && !this.shownRulePopup) {
        this.shownRulePopup = true
        this.$refs.rules?.show()
      }
      return ret
    },
  },
  watch: {
    groupid: {
      async handler(newVal, oldVal) {
        this.context = null

        const modGroupStore = useModGroupStore()
        await modGroupStore.fetchIfNeedBeMT(newVal)
        this.group = modGroupStore.get(newVal)
        await this.getMessages()

        this.show = this.messages.length
      },
    },
  },
  async mounted() {
    // Get groups with MT info
    this.modGroupStore.getModGroups()

    // Consider affiliation ask.
    const lastask = this.miscStore.get('lastaffiliationask')
    const now = new Date().getTime()

    // Ask for affiliation not too frequently.
    if (!lastask || now - lastask > 7 * 24 * 60 * 60 * 1000) {
      function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5)
      }
      const groups = shuffleArray(this.groups)

      for (const group of groups) {
        // console.log('group', group.nameshort)
        if (group.myrole === 'Owner' || group.myrole === 'Moderator') {
          const postdate = dayjs(group.affiliationconfirmed)
          const daysago = dayjs().diff(postdate, 'day')
          // console.log('daysago', daysago)
          if (!group.affiliationconfirmed || daysago > 365) {
            this.affiliationGroup = group.id
            break
          }
        }
      }

      this.miscStore.set({ key: 'lastaffiliationask', value: now })
    }

    // AIMS
    const me = this.authStore.user
    const lastaimsshow = me?.settings?.lastaimsshow

    if (!lastaimsshow || dayjs().diff(dayjs(lastaimsshow), 'days') > 365) {
      this.showAimsModal = true

      const settings = me.settings
      settings.lastaimsshow = dayjs().toISOString()
      await this.authStore.saveAndGet({
        settings,
      })
    }

    // CAKE
    if (!this.miscStore.get('cakeasked')) {
      this.showCakeModal = true
      this.miscStore.set({ key: 'cakeasked', value: true })
    }
  },
  methods: {
    async loadAll() {
      // This is a bit of a hack - we clear the store and fetch 1000 messages, which is likely to be all of them.
      this.limit = 1000
      await this.getMessages()

      this.$refs.end.scrollIntoView()
    },
    destroy(oldid, nextid) {
      this.nextAfterRemoved = nextid
    },
  },
}
</script>
