<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModCakeModal />
      <ModAimsModal ref="aims" />
      <!--      <ModFreeStock class="mb-2" />-->
      <NoticeMessage variant="info" class="mb-2 d-block d-md-none">
        <ModZoomStock color-class="text-black" />
      </NoticeMessage>

      <div v-for="(message, ix) in visibleMessages" :key="'messagelist-' + message.id" class="p-0 mt-2">
        <div :ref="'top' + message.id" />
        <ModMessage :message="message" :next="ix < visibleMessages.length - 1 ? visibleMessages[ix + 1].id : null" :next-after-removed="nextAfterRemoved" @destroy="destroy" />
        <div :ref="'bottom' + message.id" />
      </div>

      <ModAffiliationConfirmModal v-if="affiliationGroup" ref="affiliation" :groupid="affiliationGroup" />

      <div ref="end" />
    </client-only>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { useMiscStore } from '@/stores/misc'
import ScrollToTop from '~/components/ScrollToTop'

export default {
  setup() {
    const miscStore = useMiscStore()
    return { miscStore }
  },
  mixins: [
    //loginRequired,
    //createGroupRoute('modtools/messages/pending'),
    //modMessagesPage,
    //shuffle
  ],
  data: function () {
    return {
      collection: 'Pending',
      workType: 'pending',
      affiliationGroup: null
    }
  },
  mounted() {
    // Consider affiliation ask.
    const lastask = this.miscStore.get('lastaffiliationask')
    const now = new Date().getTime()

    // Ask for affiliation not too frequently.
    if (!lastask || now - lastask > 7 * 24 * 60 * 60 * 1000) {
      function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
      }
      const myGroups = shuffleArray(this.myGroups)
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

  },
  methods: {
    async loadAll() {
      // TODO
    }
  }
}
</script>
