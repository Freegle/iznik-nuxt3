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
      <div ref="end" />
    </client-only>
  </div>
</template>

<script>
import { useMiscStore } from '@/stores/misc'
import NoticeMessage from '~/components/NoticeMessage'
import ScrollToTop from '~/components/ScrollToTop'

export default {
  components: {
  },
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
    this.miscStore.set({ key: 'lastaffiliationask', value: now })
    //console.log('refs', this.$refs)
    //this.$refs.aims.show() TODO
  },
  methods: {
    async loadAll() {
      // TODO
    }
  }
}
</script>
