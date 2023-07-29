<template>
  <div v-if="newsfeed" class="d-flex align-items-center mt-1">
    <b-button v-if="!newsfeed.loved" variant="link" size="sm" @click="love">
      <v-icon v-if="loving" icon="sync" class="fa-spin text-success" />
      <v-icon v-else icon="heart" />
      <span class="d-none d-sm-inline ml-1">Love this</span>
    </b-button>
    <b-button v-if="newsfeed.loved" variant="link" size="sm" @click="unlove">
      <v-icon icon="heart" class="text-danger" /><span
        class="d-none d-sm-inline"
        >&nbsp;Unlove this</span
      >
    </b-button>
    <b-button
      v-if="!newsfeed.closed"
      variant="link"
      size="sm"
      @click="focusComment"
    >
      <v-icon icon="comment" /><span class="d-none d-sm-inline"
        >&nbsp;Reply</span
      >
    </b-button>
    <b-button
      v-if="newsfeed.loves"
      variant="link"
      class="showlove"
      :aria-label="getShowLovesLabel"
      @click="showLove"
    >
      <v-icon icon="heart" class="text-danger" />&nbsp;{{ newsfeed.loves }}
    </b-button>
    <NewsLovesModal v-if="showLoveModal" :id="newsfeed.id" ref="loveModal" />
  </div>
</template>
<script>
import pluralize from 'pluralize'
import { useNewsfeedStore } from '../stores/newsfeed'
import NewsLovesModal from './NewsLovesModal'

export default {
  components: {
    NewsLovesModal,
  },
  props: {
    newsfeed: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const newsfeedStore = useNewsfeedStore()

    return {
      newsfeedStore,
    }
  },
  data() {
    return {
      loving: false,
      showLoveModal: false,
    }
  },
  computed: {
    getShowLovesLabel() {
      return (
        'This comment has ' +
        pluralize('love', this.newsfeed?.loves, true) +
        '. Who loves this?'
      )
    },
  },
  methods: {
    async love() {
      this.loving = true

      await this.newsfeedStore.love(this.newsfeed.id, this.newsfeed.threadhead)

      this.loving = false
    },
    async unlove() {
      this.loving = true

      await this.newsfeedStore.unlove(
        this.newsfeed.id,
        this.newsfeed.threadhead
      )

      this.loving = false
    },
    focusComment() {
      this.$emit('focus-comment')
    },
    async showLove() {
      this.showLoveModal = true

      await this.waitForRef('loveModal')
      this.$refs.loveModal?.show()
    },
  },
}
</script>
<style scoped lang="scss">
.showlove {
  border: none;
  padding: 3px;
}
</style>
