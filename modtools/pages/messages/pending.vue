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

<script>
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { setupModMessages } from '~/composables/useModMessages'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'
import { useMe } from '~/composables/useMe'

export default {
  setup() {
    const authStore = useAuthStore()
    const messageStore = useMessageStore()
    const miscStore = useMiscStore()
    const modGroupStore = useModGroupStore()
    const modMessages = setupModMessages(true)
    modMessages.summarykey.value = 'modtoolsMessagesPendingSummary'
    // modMessages.collection.value = ['Pending','PendingOther']
    modMessages.collection.value = 'Pending' // Pending also gets PendingOther
    modMessages.workType.value = ['pending', 'pendingother']
    // modMessages.workType.value = 'pending'
    const { me, myGroups } = useMe()
    return {
      authStore,
      messageStore,
      miscStore,
      modGroupStore,
      me,
      myGroups,
      ...modMessages, // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
    }
  },
  data: function () {
    return {
      showCakeModal: false,
      showAimsModal: false,
      affiliationGroup: null,
      shownRulePopup: false,
      bump: 0,
      highlightMsgId: null,
      urlOverride: false,
    }
  },
  computed: {
    groups() {
      const ret = Object.values(this.modGroupStore.list)
      return ret
    },
    groupsreceived() {
      return this.modGroupStore.received
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
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.shownRulePopup = true
        this.$refs.rules?.show()
      }
      return ret
    },
  },
  watch: {
    groupid: {
      async handler(newVal, oldVal) {
        // console.log('PENDING groupid changed', oldVal, newVal)
        this.context = null

        const modGroupStore = useModGroupStore()
        await modGroupStore.fetchIfNeedBeMT(newVal)
        this.group = modGroupStore.get(newVal)
        this.show = 0
        this.bump++
      },
    },
    visibleMessages: {
      handler(newVal) {
        // Scroll to highlighted message when it appears in the list.
        if (this.highlightMsgId && newVal?.length) {
          const found = newVal.find((m) => m.id === this.highlightMsgId)
          if (found) {
            this.$nextTick(() => {
              const el = document.getElementById('msg-' + this.highlightMsgId)
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                // Clear highlight so we don't scroll again on future updates.
                this.highlightMsgId = null
              }
            })
          }
        }
      },
    },
  },
  async mounted() {
    // Check for query params from duplicate message link.
    const route = useRoute()
    if (route.query.groupid !== undefined) {
      this.groupid = parseInt(route.query.groupid)
      // Mark that URL explicitly set the group (even if 0 for "All").
      this.urlOverride = true
    }
    if (route.query.msgid) {
      this.highlightMsgId = parseInt(route.query.msgid)
    }

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

    // Note: Don't restore remembered group here - ModGroupSelect handles it
    // via its remember prop. Doing it here would override URL params.
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
    async loadMore($state) {
      this.busy = true
      // console.log( 'Pending loadMore:', this.show, this.visibleMessages?.length, this.messages?.length, this.modGroupStore.received)
      if (!this.me) {
        console.log('Ignore load more on MT page with no session.')
        $state.complete()
      } else if (this.show < this.messages.length) {
        // console.log('Pending loadMore inc')
        // This means that we will gradually add the messages that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        // console.log('this.show++', this.show)
        this.show++
        $state.loaded()
      } else {
        // const currentCount = this.messages.length
        const currentCount = Object.keys(this.messageStore.list).length // Use total messages found, not just this,messages as this stops too soon
        // console.log('Actually loadMore', currentCount)

        const params = {
          groupid: this.groupid,
          collection: this.collection,
          modtools: true,
          summary: false,
          context: this.context,
          limit: this.messages.length + this.distance,
        }

        await this.messageStore.fetchMessagesMT(params)
        this.context = this.messageStore.context

        if (currentCount === Object.keys(this.messageStore.list).length) {
          $state.complete()
        } else {
          $state.loaded()
          this.show++
        }
      }
      this.busy = false
    },
  },
}
</script>
