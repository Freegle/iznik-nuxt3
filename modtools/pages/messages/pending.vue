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
      <div class="d-flex justify-content-between">
        <GroupSelect v-model="groupid" all modonly :work="['pending', 'pendingother']" remember="pending" />
        <b-button variant="link" @click="loadAll">
          Load all
        </b-button>
      </div>
      <ModMessages :collection="collection" :group="group" />

      <ModAffiliationConfirmModal v-if="affiliationGroup" ref="affiliation" :groupid="affiliationGroup" />

      <div ref="end" />
    </client-only>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { useMiscStore } from '@/stores/misc'
import ScrollToTop from '~/components/ScrollToTop'
import { setupModMessages } from '../composables/useModMessages'

const {
  busy, context, group, groupid, limit, workType, show  
  //context, distance, limit, workType, show, busy, messageTerm, memberTerm, modalOpen, scrollHeight, scrollTop, nextAfterRemoved, 
  //visibleMessages, messages,work 
} = setupModMessages()

workType.value = 'pending'

const miscStore = useMiscStore()

const collection = ref('Pending')
const affiliationGroup = ref(null)

//  mixins: [
//    //loginRequired,
//    //createGroupRoute('modtools/messages/pending'),
//    //modMessagesPage,
//    //shuffle
//  ],

onMounted(() => {
  // Consider affiliation ask.
  const lastask = miscStore.get('lastaffiliationask')
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
          affiliationGroup.value = group.id
          break
        }
      }
    }

    miscStore.set({ key: 'lastaffiliationask', value: now })
  }

})
const loadAll = async () => {
  /*
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
}
</script>
