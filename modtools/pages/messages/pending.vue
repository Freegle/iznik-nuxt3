<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModCakeModal v-if="showCakeModal" ref="showCakeModal" @hidden="showCakeModal = false"/>
      <ModAimsModal v-if="showAimsModal" ref="showAimsModal" @hidden="showAimsModal = false"/>
      <!--      <ModFreeStock class="mb-2" />-->
      <NoticeMessage variant="info" class="mb-2 d-block d-md-none">
        <ModZoomStock color-class="text-black" />
      </NoticeMessage>
      <div class="d-flex justify-content-between">
        <GroupSelect v-model="groupid" all modonly :work="['pending', 'pendingother']" remember="pending" />
        <b-button variant="link" @click="loadAll">
          Load all
        </b-button>
      </div>
      <NoticeMessage v-if="!messages.length && !busy" class="mt-2">
        There are no messages at the moment. This will refresh automatically.
      </NoticeMessage>
      <ModMessages />

      <ModAffiliationConfirmModal v-if="affiliationGroup" ref="affiliation" :groupid="affiliationGroup" />

      <div ref="end" />
    </client-only>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { useMiscStore } from '@/stores/misc'
import me from '~/mixins/me.js'
import { setupModMessages } from '../../composables/useModMessages'

export default {
  async setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const modMessages = setupModMessages()
    //modMessages.collection.value = ['Pending','PendingOther']
    modMessages.collection.value = 'Pending'
    modMessages.workType.value = 'pending'
    return {
      authStore,
      miscStore,
      ...modMessages // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
    }
  },
  mixins: [
    me,
  ],
  data: function () {
    return {
      showCakeModal: false,
      showAimsModal: false,
      affiliationGroup: null
    }
  },

  async mounted() {
    // Consider affiliation ask.
    const lastask = this.miscStore.get('lastaffiliationask')
    const now = new Date().getTime()

    // Ask for affiliation not too frequently.
    if (!lastask || now - lastask > 7 * 24 * 60 * 60 * 1000) {
      function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
      }
      const myGroups = shuffleArray(this.myGroups) // me
      console.log('myGroups', myGroups.length)

      for (const group of myGroups) {
        console.log('group', group.nameshort)
        if (group.role === 'Owner' || group.role === 'Moderator') {
          const postdate = dayjs(group.affiliationconfirmed)
          const daysago = dayjs().diff(postdate, 'day')
          console.log('daysago', daysago)
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

    if (
      !lastaimsshow ||
      dayjs().diff(dayjs(lastaimsshow), 'days') > 365
    ) {
      this.showAimsModal = true

      const settings = me.settings
      settings.lastaimsshow = dayjs().toISOString()
      await this.authStore.saveAndGet({
        settings: settings
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
      /* TODO
      // This is a bit of a hack - we clear the store and fetch 1000 messages, which is likely to be all of them.
      this.limit = 1000
      await this.$store.dispatch('messages/clearContext')
      await this.$store.dispatch('messages/clear')
      const self = this
    
      this.loadMore({
        loaded() {
          self.show = self.messages.length
          self.$nextTick(() => {
            self.$refs.end.scrollIntoView()
          })
        },
        complete() {
          self.show = self.messages.length
          self.$nextTick(() => {
            self.$refs.end.scrollIntoView()
          })
        }
      })*/
    },
    destroy(oldid, nextid) {
      this.nextAfterRemoved = nextid
    }

  }
}
</script>
